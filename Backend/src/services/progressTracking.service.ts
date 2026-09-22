/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 7: Actual-vs-Planned Progress Tracking Service
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import {
  CycleProgressSummary,
  StageProgressDetail,
} from "../types/fieldActivity.types";
import { UnauthorizedFarmAccessError } from "../types/weather.types";
import { addDays, daysBetween } from "../utils/date.utils";

export class ProgressTrackingService {
  /**
   * Retrieves deterministic actual-vs-planned cycle progress analytics.
   */
  public static async getCycleProgress(
    userId: string,
    cropCycleId: string
  ): Promise<CycleProgressSummary> {
    // 1. Verify Cycle Ownership
    const { data: cycle, error: cycleErr } = await supabaseAdmin
      .from("crop_cycles")
      .select("*")
      .eq("id", cropCycleId)
      .maybeSingle();

    if (cycleErr || !cycle) {
      throw new Error(`Crop cycle not found: ${cropCycleId}`);
    }

    if (cycle.user_id !== userId) {
      throw new UnauthorizedFarmAccessError(
        `Unauthorized: User does not own crop cycle ${cropCycleId}`
      );
    }

    // 2. Fetch Stages and Tasks
    const { data: stages } = await supabaseAdmin
      .from("crop_cycle_stages")
      .select("*")
      .eq("crop_cycle_id", cropCycleId)
      .order("stage_order", { ascending: true });

    const { data: tasks } = await supabaseAdmin
      .from("farm_tasks")
      .select("*")
      .eq("crop_cycle_id", cropCycleId)
      .order("target_date", { ascending: true });

    // 3. Fetch Recent Field Activities
    const { data: recentActivities } = await supabaseAdmin
      .from("field_activity_logs")
      .select("*")
      .eq("crop_cycle_id", cropCycleId)
      .order("created_at", { ascending: false })
      .limit(20);

    const safeStages = stages || [];
    const safeTasks = tasks || [];

    // 4. Compute Stage-by-Stage Details
    const stageDetails: StageProgressDetail[] = safeStages.map((stage) => {
      const stageTasks = safeTasks.filter((t) => t.stage_id === stage.id);
      const completed = stageTasks.filter((t) => t.status === "COMPLETED").length;
      const skipped = stageTasks.filter((t) => t.status === "SKIPPED").length;
      const unable = stageTasks.filter((t) => t.status === "UNABLE_TO_COMPLETE").length;

      const stageVariance = stage.actual_start_date
        ? daysBetween(stage.target_start_date, stage.actual_start_date)
        : 0;

      return {
        stageId: stage.id,
        stageOrder: stage.stage_order,
        stageCode: stage.stage_code,
        stageName: stage.stage_name,
        status: stage.status,
        plannedDates: {
          start: stage.target_start_date,
          end: stage.target_end_date,
        },
        actualDates: {
          start: stage.actual_start_date,
          end: stage.actual_end_date,
        },
        varianceDays: stageVariance,
        tasksTotal: stageTasks.length,
        tasksCompleted: completed,
        tasksSkipped: skipped,
        tasksUnable: unable,
        hasOmissions: skipped > 0 || unable > 0,
      };
    });

    // 5. Calculate Overall Completion %
    const totalTasks = safeTasks.length;
    const totalCompleted = safeTasks.filter((t) => t.status === "COMPLETED").length;
    const overallProgressPct =
      totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 1000) / 10 : 0;

    // 6. Calculate Observed Sowing Drift
    let netObservedSowingDriftDays = 0;
    const sowingTask = safeTasks.find((t) => t.category === "SOWING");
    if (sowingTask && sowingTask.status === "COMPLETED") {
      const sowingActivity = (recentActivities || []).find(
        (a) => a.task_id === sowingTask.id && a.status === "COMPLETED"
      );
      if (sowingActivity) {
        netObservedSowingDriftDays = daysBetween(
          cycle.sowing_date,
          sowingActivity.action_date
        );
      }
    } else if (safeStages.length > 0 && safeStages[0].actual_start_date) {
      netObservedSowingDriftDays = daysBetween(
        cycle.sowing_date,
        safeStages[0].actual_start_date
      );
    }

    // 7. Linear Operational Projected Harvest Date
    const operationalProjectedHarvestDate = addDays(
      cycle.target_harvest_date,
      netObservedSowingDriftDays
    );

    // 8. Adherence Status Classification
    const absDrift = Math.abs(netObservedSowingDriftDays);
    let adherenceStatus: "ON_TRACK" | "MINOR_DRIFT" | "SIGNIFICANT_DRIFT" = "ON_TRACK";
    if (absDrift > 7) {
      adherenceStatus = "SIGNIFICANT_DRIFT";
    } else if (absDrift >= 3) {
      adherenceStatus = "MINOR_DRIFT";
    }

    return {
      cycleId: cropCycleId,
      cropCode: cycle.crop_code,
      varietyCode: cycle.variety_code,
      cycleStatus: cycle.status,
      sowingDate: cycle.sowing_date,
      plannedHarvestDate: cycle.target_harvest_date,
      operationalProjectedHarvestDate,
      projectionDisclaimer:
        "Projected harvest date is a linear operational planning adjustment based on observed milestone drift. Actual crop maturity depends on thermal units and weather (ICAR-IIWBR).",
      netObservedSowingDriftDays,
      adherenceStatus,
      overallProgressPct,
      stages: stageDetails,
      recentActivities: (recentActivities || []) as any,
    };
  }
}
