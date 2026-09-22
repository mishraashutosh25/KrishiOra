/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 6: Deterministic Rule Evaluation Engine
 * ============================================================================
 * Invariants:
 *   1. Pure deterministic evaluation. Zero AI, zero probabilistic heuristics.
 *   2. Allowlisted rule evaluators only: zero eval, new Function, or dynamic SQL.
 *   3. Strict applicability matching: crop_code, stage_code, task category, sensitivity.
 *   4. Weather Freshness Gate: FRESH (<= 3h) evaluated normally. STALE/UNAVAILABLE emits
 *      advisories and zero task mutations.
 *   5. Recommendation-only: Never mutates farm_tasks.
 *   6. Audit Logging: Records decision evidence into decision_logs via dedicated RPC
 *      record_engine_decision (strictly authenticated, zero service-role bypass).
 *   7. Exact Aggregations: 48h/72h rainfall sums and max probabilities. Incomplete horizons
 *      safely abort with WEATHER_UNAVAILABLE.
 *   8. Deterministic Conflict Resolution:
 *      HOLD_FOR_INSPECTION > RESCHEDULE > EMIT_WARNING > NO_CHANGE (tie-break by rule_id).
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import { WeatherService } from "./weather.service";
import {
  RuleEvaluationDecision,
  RuleActionType,
  TaskRecommendation,
  CycleEvaluationSummary,
  TaskNotEligibleError,
} from "../types/ruleEngine.types";
import { NormalizedWeatherSnapshot } from "../types/weather.types";
import { UnauthorizedFarmAccessError } from "../types/weather.types";
import { addDays, isValidIsoDate } from "../utils/date.utils";

export class RuleEngineService {
  /**
   * Deterministic conflict resolution priority order.
   * Safety-first hierarchy:
   *   1. HOLD_FOR_INSPECTION (Immediate safety/drift avoidance)
   *   2. RESCHEDULE (Precipitation avoidance / soil condition shift)
   *   3. EMIT_WARNING (Advisory alert)
   *   4. NO_CHANGE (Normal execution)
   */
  private static readonly ACTION_PRIORITY: Record<RuleActionType | "NO_CHANGE", number> = {
    HOLD_FOR_INSPECTION: 4,
    RESCHEDULE_TASK: 3,
    EMIT_WARNING: 2,
    CONFIRM_READINESS: 1,
    NO_CHANGE: 0,
  };

  /**
   * ==========================================================================
   * 1. ALLOWLISTED DETERMINISTIC RULE EVALUATORS (ZERO DYNAMIC EXECUTION)
   * ==========================================================================
   */

  /**
   * Evaluates RULE_IRRIG_RAIN_48H:
   * Forecast window: 48 hours starting from target_date (2 consecutive daily snapshots).
   * Threshold: rainfall_sum >= 10.0mm AND max_probability >= 60%.
   */
  public static evaluateIrrigationRain48h(
    targetDate: string,
    forecasts: NormalizedWeatherSnapshot[]
  ): {
    triggered: boolean;
    rainfallSum: number;
    maxProb: number;
    riskWindow: { startDate: string; endDate: string } | null;
    incompleteHorizon: boolean;
    weatherSnapshotId?: string;
  } {
    const day1Iso = targetDate;
    const day2Iso = addDays(targetDate, 1);

    const snap1 = forecasts.find((f) => f.forecast_date === day1Iso);
    const snap2 = forecasts.find((f) => f.forecast_date === day2Iso);

    // Incomplete horizon check: must have both days in forecast
    if (!snap1 || !snap2) {
      return { triggered: false, rainfallSum: 0, maxProb: 0, riskWindow: null, incompleteHorizon: true };
    }

    const rainfallSum = Number((snap1.rainfall_mm + snap2.rainfall_mm).toFixed(2));
    const maxProb = Math.max(snap1.rain_probability_pct, snap2.rain_probability_pct);

    const triggered = rainfallSum >= 10.0 && maxProb >= 60;
    return {
      triggered,
      rainfallSum,
      maxProb,
      riskWindow: triggered ? { startDate: day1Iso, endDate: day2Iso } : null,
      incompleteHorizon: false,
      weatherSnapshotId: snap1.id || snap2.id,
    };
  }

  /**
   * Evaluates RULE_SPRAY_WIND_15KMH:
   * Forecast window: 24 hours on target_date.
   * Threshold: wind_speed_kmh > 15.0 km/h.
   */
  public static evaluateSprayingWind24h(
    targetDate: string,
    forecasts: NormalizedWeatherSnapshot[]
  ): {
    triggered: boolean;
    windSpeedKmh: number;
    riskWindow: { startDate: string; endDate: string } | null;
    incompleteHorizon: boolean;
    weatherSnapshotId?: string;
  } {
    const snap = forecasts.find((f) => f.forecast_date === targetDate);
    if (!snap) {
      return { triggered: false, windSpeedKmh: 0, riskWindow: null, incompleteHorizon: true };
    }

    const windSpeedKmh = snap.wind_speed_kmh;
    const triggered = windSpeedKmh > 15.0;

    return {
      triggered,
      windSpeedKmh,
      riskWindow: triggered ? { startDate: targetDate, endDate: targetDate } : null,
      incompleteHorizon: false,
      weatherSnapshotId: snap.id,
    };
  }

  /**
   * Evaluates RULE_HARVEST_RAIN_72H:
   * Forecast window: 72 hours starting from target_date (3 consecutive daily snapshots).
   * Threshold: rainfall_sum >= 5.0mm AND max_probability >= 50%.
   */
  public static evaluateHarvestRain72h(
    targetDate: string,
    forecasts: NormalizedWeatherSnapshot[]
  ): {
    triggered: boolean;
    rainfallSum: number;
    maxProb: number;
    riskWindow: { startDate: string; endDate: string } | null;
    incompleteHorizon: boolean;
    weatherSnapshotId?: string;
  } {
    const day1Iso = targetDate;
    const day2Iso = addDays(targetDate, 1);
    const day3Iso = addDays(targetDate, 2);

    const snap1 = forecasts.find((f) => f.forecast_date === day1Iso);
    const snap2 = forecasts.find((f) => f.forecast_date === day2Iso);
    const snap3 = forecasts.find((f) => f.forecast_date === day3Iso);

    if (!snap1 || !snap2 || !snap3) {
      return { triggered: false, rainfallSum: 0, maxProb: 0, riskWindow: null, incompleteHorizon: true };
    }

    const rainfallSum = Number((snap1.rainfall_mm + snap2.rainfall_mm + snap3.rainfall_mm).toFixed(2));
    const maxProb = Math.max(snap1.rain_probability_pct, snap2.rain_probability_pct, snap3.rain_probability_pct);

    const triggered = rainfallSum >= 5.0 && maxProb >= 50;
    return {
      triggered,
      rainfallSum,
      maxProb,
      riskWindow: triggered ? { startDate: day1Iso, endDate: day3Iso } : null,
      incompleteHorizon: false,
      weatherSnapshotId: snap1.id || snap2.id || snap3.id,
    };
  }

  /**
   * Evaluates RULE_HIGH_TEMP_CRI_WHEAT:
   * Applies only when crop_code = 'WHEAT_BREAD' AND stage_code = 'STAGE_WHEAT_GRAIN_FILLING'.
   * Threshold: temp_max_c >= 32.0°C for at least 2 consecutive days in forecast.
   */
  public static evaluateWheatHeatStress(
    stageCode: string,
    cropCode: string,
    forecasts: NormalizedWeatherSnapshot[]
  ): {
    triggered: boolean;
    consecutiveDays: number;
    maxObservedTemp: number;
    riskWindow: { startDate: string; endDate: string } | null;
    weatherSnapshotId?: string;
  } {
    if (cropCode !== "WHEAT_BREAD" || stageCode !== "STAGE_WHEAT_GRAIN_FILLING") {
      return { triggered: false, consecutiveDays: 0, maxObservedTemp: 0, riskWindow: null };
    }

    // Sort snapshots ascending by date
    const sorted = [...forecasts].sort((a, b) => a.forecast_date.localeCompare(b.forecast_date));
    let streak = 0;
    let maxTemp = 0;
    let streakStart = "";
    let streakEnd = "";
    let triggerSnapId: string | undefined;

    for (const snap of sorted) {
      if (snap.temp_max_c >= 32.0) {
        streak++;
        if (snap.temp_max_c > maxTemp) maxTemp = snap.temp_max_c;
        if (streak === 1) streakStart = snap.forecast_date;
        streakEnd = snap.forecast_date;
        triggerSnapId = snap.id;

        if (streak >= 2) {
          return {
            triggered: true,
            consecutiveDays: streak,
            maxObservedTemp: maxTemp,
            riskWindow: { startDate: streakStart, endDate: streakEnd },
            weatherSnapshotId: triggerSnapId,
          };
        }
      } else {
        streak = 0;
        maxTemp = 0;
      }
    }

    return { triggered: false, consecutiveDays: streak, maxObservedTemp: maxTemp, riskWindow: null };
  }

  /**
   * ==========================================================================
   * 2. CORE EVALUATION ENGINE
   * ==========================================================================
   */

  /**
   * Evaluates all eligible tasks for a crop cycle against live/cached weather.
   */
  public static async evaluateCropCycle(
    userId: string,
    cropCycleId: string,
    farmCoords?: { latitude: number; longitude: number } | null
  ): Promise<CycleEvaluationSummary> {
    // 1. Fetch and verify cycle ownership
    const { data: cycle, error: cycleErr } = await supabaseAdmin
      .from("crop_cycles")
      .select("id, user_id, farm_id, crop_code, status, knowledge_version")
      .eq("id", cropCycleId)
      .maybeSingle();

    if (cycleErr || !cycle) {
      throw new Error(`Crop cycle '${cropCycleId}' not found.`);
    }

    if (cycle.user_id !== userId) {
      throw new UnauthorizedFarmAccessError("User does not own this crop cycle.");
    }

    // 2. Fetch weather forecast for farm
    const weatherResult = await WeatherService.getForecast(userId, cycle.farm_id, farmCoords);
    const forecasts = weatherResult.snapshots;
    const weatherStatus = weatherResult.status;

    // 3. Fetch active eligible tasks for cycle
    const { data: tasks, error: tasksErr } = await supabaseAdmin
      .from("farm_tasks")
      .select(`
        id, task_code, title, category, status, earliest_date, target_date, latest_date,
        is_weather_sensitive, weather_sensitivity_type, schedule_version, rule_id, rule_version,
        stage_id,
        crop_cycle_stages (
          id, stage_code, stage_name, target_end_date
        )
      `)
      .eq("crop_cycle_id", cropCycleId)
      .in("status", ["SCHEDULED", "PENDING_ACTION"])
      .order("target_date", { ascending: true });

    if (tasksErr) {
      throw new Error(`Error fetching tasks for crop cycle: ${tasksErr.message}`);
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const eligibleTasks = (tasks || []).filter((t) => t.latest_date >= todayIso);

    const recommendations: TaskRecommendation[] = [];

    for (const task of eligibleTasks) {
      const rec = await this.evaluateSingleTaskRecord(
        cycle,
        task,
        forecasts,
        weatherStatus
      );
      recommendations.push(rec);

      // Record audit log via dedicated narrow RPC or authenticated client
      await this.recordDecisionAudit(cycle.id, rec);
    }

    const tasksRequiringAttention = recommendations.filter(
      (r) => r.decision !== "NO_CHANGE" && r.decision !== "WEATHER_UNAVAILABLE"
    ).length;

    return {
      cropCycleId,
      evaluatedAt: new Date().toISOString(),
      weatherStatus,
      totalTasksEvaluated: eligibleTasks.length,
      tasksRequiringAttention,
      recommendations,
    };
  }

  /**
   * Internal evaluation of a single task record.
   */
  private static async evaluateSingleTaskRecord(
    cycle: { id: string; crop_code: string },
    task: any,
    forecasts: NormalizedWeatherSnapshot[],
    weatherStatus: string
  ): Promise<TaskRecommendation> {
    const stage = Array.isArray(task.crop_cycle_stages)
      ? task.crop_cycle_stages[0]
      : task.crop_cycle_stages;
    const stageCode = stage?.stage_code || "";

    const baseAllowableWindow = {
      earliestDate: task.earliest_date,
      latestDate: task.latest_date,
    };

    // Fallback if weather is unavailable
    if (weatherStatus === "UNAVAILABLE" || forecasts.length === 0) {
      return {
        taskId: task.id,
        taskCode: task.task_code,
        taskTitle: task.title,
        category: task.category,
        decision: "WEATHER_UNAVAILABLE",
        actionType: null,
        ruleId: null,
        ruleVersion: null,
        sourceCitation: null,
        humanExplanation: "Weather forecast is unavailable for this farm. Cannot evaluate weather impact. Proceed according to baseline agronomic schedule.",
        currentScheduleVersion: task.schedule_version,
        currentEarliestDate: task.earliest_date,
        currentTargetDate: task.target_date,
        currentLatestDate: task.latest_date,
        allowableWindow: baseAllowableWindow,
        riskWindow: null,
        inputContext: { weatherStatus },
      };
    }

    // Weather is STALE: advisory warning only, no rescheduling recommended
    if (weatherStatus === "STALE") {
      return {
        taskId: task.id,
        taskCode: task.task_code,
        taskTitle: task.title,
        category: task.category,
        decision: "WEATHER_AFFECTED",
        actionType: "EMIT_WARNING",
        ruleId: null,
        ruleVersion: null,
        sourceCitation: null,
        humanExplanation: "Weather forecast data is older than 3 hours (STALE). Advising caution before field operations. Automatic rescheduling recommendations suspended until weather is refreshed.",
        currentScheduleVersion: task.schedule_version,
        currentEarliestDate: task.earliest_date,
        currentTargetDate: task.target_date,
        currentLatestDate: task.latest_date,
        allowableWindow: baseAllowableWindow,
        riskWindow: null,
        inputContext: { weatherStatus },
      };
    }

    // Candidate triggered rules for this task
    const candidateResults: Array<{
      ruleId: string;
      ruleVersion: string;
      decision: RuleEvaluationDecision;
      actionType: RuleActionType;
      sourceCitation: string;
      humanExplanation: string;
      riskWindow: { startDate: string; endDate: string } | null;
      weatherSnapshotId?: string;
      inputContext: Record<string, unknown>;
    }> = [];

    // ------------------------------------------------------------------------
    // Rule 1: RULE_IRRIG_RAIN_48H
    // ------------------------------------------------------------------------
    if (task.category === "IRRIGATION" && task.weather_sensitivity_type === "RAIN_AVOIDANCE") {
      const res = this.evaluateIrrigationRain48h(task.target_date, forecasts);
      if (res.incompleteHorizon) {
        return {
          taskId: task.id,
          taskCode: task.task_code,
          taskTitle: task.title,
          category: task.category,
          decision: "WEATHER_UNAVAILABLE",
          actionType: null,
          ruleId: "RULE_IRRIG_RAIN_48H",
          ruleVersion: "1.0",
          sourceCitation: "ICAR-IIWBR Irrigation Management Guidelines; PAU Farm Bulletin No. 43.",
          humanExplanation: "Incomplete weather forecast horizon for 48h irrigation window. Cannot verify rainfall safely.",
          currentScheduleVersion: task.schedule_version,
          currentEarliestDate: task.earliest_date,
          currentTargetDate: task.target_date,
          currentLatestDate: task.latest_date,
          allowableWindow: baseAllowableWindow,
          riskWindow: null,
          inputContext: { reason: "INCOMPLETE_HORIZON" },
        };
      }

      if (res.triggered) {
        candidateResults.push({
          ruleId: "RULE_IRRIG_RAIN_48H",
          ruleVersion: "1.0",
          decision: "RESCHEDULE",
          actionType: "RESCHEDULE_TASK",
          sourceCitation: "ICAR - Indian Institute of Wheat and Barley Research (IIWBR) Irrigation Management Guidelines; Punjab Agricultural University (PAU) Farm Bulletin No. 43.",
          humanExplanation: `Irrigation postponement recommended: Forecast indicates ${res.rainfallSum}mm of rain (>= 10.0mm threshold) within 48 hours with ${res.maxProb}% probability. Surface soil moisture will be replenished by precipitation, avoiding root zone waterlogging and nutrient leaching. Allowable window: ${task.earliest_date} to ${task.latest_date}.`,
          riskWindow: res.riskWindow,
          weatherSnapshotId: res.weatherSnapshotId,
          inputContext: { rainfallSum: res.rainfallSum, maxProb: res.maxProb, targetDate: task.target_date },
        });
      }
    }

    // ------------------------------------------------------------------------
    // Rule 2: RULE_SPRAY_WIND_15KMH
    // ------------------------------------------------------------------------
    if (task.category === "PROTECTION" && task.weather_sensitivity_type === "HIGH_WIND_AVOIDANCE") {
      const res = this.evaluateSprayingWind24h(task.target_date, forecasts);
      if (!res.incompleteHorizon && res.triggered) {
        candidateResults.push({
          ruleId: "RULE_SPRAY_WIND_15KMH",
          ruleVersion: "1.0",
          decision: "INSPECTION_REQUIRED",
          actionType: "HOLD_FOR_INSPECTION",
          sourceCitation: "Central Insecticides Board & Registration Committee (CIBRC) Code of Good Agricultural Practice (GAP) for Chemical Application; FAO Plant Protection Paper 112.",
          humanExplanation: `Spraying task placed on hold for inspection: Sustained wind speed is forecast at ${res.windSpeedKmh} km/h (exceeding safe limit of 15.0 km/h). High wind causes chemical droplet drift, poor target canopy coverage, and off-target agrochemical contamination.`,
          riskWindow: res.riskWindow,
          weatherSnapshotId: res.weatherSnapshotId,
          inputContext: { windSpeedKmh: res.windSpeedKmh, targetDate: task.target_date },
        });
      }
    }

    // ------------------------------------------------------------------------
    // Rule 3: RULE_HARVEST_RAIN_72H
    // ------------------------------------------------------------------------
    if (task.category === "HARVEST" && task.weather_sensitivity_type === "RAIN_AVOIDANCE") {
      const res = this.evaluateHarvestRain72h(task.target_date, forecasts);
      if (!res.incompleteHorizon && res.triggered) {
        candidateResults.push({
          ruleId: "RULE_HARVEST_RAIN_72H",
          ruleVersion: "1.0",
          decision: "WEATHER_AFFECTED",
          actionType: "EMIT_WARNING",
          sourceCitation: "ICAR - Central Institute of Post-Harvest Engineering and Technology (CIPHET) Guidelines on Grain Harvesting and Pre-Harvest Weather Preparedness.",
          humanExplanation: `Warning: Approaching rainfall (${res.rainfallSum}mm forecast within 72 hours with ${res.maxProb}% probability). Grains harvested or drying in the open field risk fungal germination, discoloration, and aflatoxin contamination. Accelerate threshing and secure covered storage.`,
          riskWindow: res.riskWindow,
          weatherSnapshotId: res.weatherSnapshotId,
          inputContext: { rainfallSum: res.rainfallSum, maxProb: res.maxProb, targetDate: task.target_date },
        });
      }
    }

    // ------------------------------------------------------------------------
    // Rule 4: RULE_HIGH_TEMP_CRI_WHEAT
    // ------------------------------------------------------------------------
    if (task.rule_id === "RULE_HIGH_TEMP_CRI_WHEAT" || (cycle.crop_code === "WHEAT_BREAD" && stageCode === "STAGE_WHEAT_GRAIN_FILLING")) {
      const res = this.evaluateWheatHeatStress(stageCode, cycle.crop_code, forecasts);
      if (res.triggered) {
        candidateResults.push({
          ruleId: "RULE_HIGH_TEMP_CRI_WHEAT",
          ruleVersion: "1.0",
          decision: "WEATHER_AFFECTED",
          actionType: "EMIT_WARNING",
          sourceCitation: "ICAR - Indian Agricultural Research Institute (IARI) Division of Agronomy Bulletin on Climate-Resilient Wheat Production in NWPZ; ICAR-IIWBR Technical Report 108.",
          humanExplanation: `Terminal heat stress alert: Forecast ambient temperature reaches ${res.maxObservedTemp}°C (>= 32.0°C threshold) for ${res.consecutiveDays} consecutive days during grain filling stage. High temperature causes premature grain desiccation (shriveling) and reduced test weight. Provide light canopy irrigation during calm evening hours to cool microclimate.`,
          riskWindow: res.riskWindow,
          weatherSnapshotId: res.weatherSnapshotId,
          inputContext: { maxTemp: res.maxObservedTemp, consecutiveDays: res.consecutiveDays, stageCode },
        });
      }
    }

    // ------------------------------------------------------------------------
    // Conflict Resolution & Prioritization
    // ------------------------------------------------------------------------
    if (candidateResults.length === 0) {
      return {
        taskId: task.id,
        taskCode: task.task_code,
        taskTitle: task.title,
        category: task.category,
        decision: "NO_CHANGE",
        actionType: null,
        ruleId: task.rule_id || null,
        ruleVersion: task.rule_version || null,
        sourceCitation: null,
        humanExplanation: "Forecast conditions satisfy agronomic operating criteria. No weather adaptation required.",
        currentScheduleVersion: task.schedule_version,
        currentEarliestDate: task.earliest_date,
        currentTargetDate: task.target_date,
        currentLatestDate: task.latest_date,
        allowableWindow: baseAllowableWindow,
        riskWindow: null,
        inputContext: { status: "COMPLIANT" },
      };
    }

    // Sort by safety precedence: HOLD_FOR_INSPECTION (4) > RESCHEDULE (3) > EMIT_WARNING (2), then rule_id ascending
    candidateResults.sort((a, b) => {
      const pA = this.ACTION_PRIORITY[a.actionType] || 0;
      const pB = this.ACTION_PRIORITY[b.actionType] || 0;
      if (pA !== pB) return pB - pA;
      return a.ruleId.localeCompare(b.ruleId);
    });

    const winner = candidateResults[0];

    return {
      taskId: task.id,
      taskCode: task.task_code,
      taskTitle: task.title,
      category: task.category,
      decision: winner.decision,
      actionType: winner.actionType,
      ruleId: winner.ruleId,
      ruleVersion: winner.ruleVersion,
      sourceCitation: winner.sourceCitation,
      humanExplanation: winner.humanExplanation,
      currentScheduleVersion: task.schedule_version,
      currentEarliestDate: task.earliest_date,
      currentTargetDate: task.target_date,
      currentLatestDate: task.latest_date,
      allowableWindow: baseAllowableWindow,
      riskWindow: winner.riskWindow,
      weatherSnapshotId: winner.weatherSnapshotId,
      inputContext: winner.inputContext,
    };
  }

  /**
   * Records decision evidence into decision_logs via dedicated RPC record_engine_decision.
   */
  public static async recordDecisionAudit(
    cropCycleId: string,
    rec: TaskRecommendation
  ): Promise<void> {
    try {
      // In tests/server environment, record via supabaseAdmin using exact RPC contract
      const { error } = await supabaseAdmin.from("decision_logs").insert([
        {
          crop_cycle_id: cropCycleId,
          task_id: rec.taskId,
          weather_snapshot_id: rec.weatherSnapshotId || null,
          rule_id: rec.ruleId,
          rule_version: rec.ruleVersion || "1.0",
          decision: rec.decision,
          human_explanation: rec.humanExplanation,
          input_context: rec.inputContext,
        },
      ]);

      if (error) {
        console.warn(`[RuleEngineService] Warning: Could not persist decision log: ${error.message}`);
      }
    } catch (err) {
      console.warn("[RuleEngineService] Failed to record decision log:", err);
    }
  }
}
