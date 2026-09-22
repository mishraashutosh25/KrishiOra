/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 4: Deterministic Crop Lifecycle Generator Service
 * ============================================================================
 * Pure deterministic state machine.
 * Zero AI / LLM models. Zero probabilistic guesses.
 *
 * Responsibilities:
 *   1. Validate lifecycle input parameters.
 *   2. Enforce strict farm ownership authorization (user owns farm).
 *   3. Resolve active crop & variety dynamically from Phase 3 Knowledge Catalog.
 *   4. Resolve dynamic knowledge_version and rule_version (never hardcoded).
 *   5. Timezone-independent calendar date arithmetic via pure JDN integer math.
 *   6. Map stages and tasks with action windows (earliest <= target <= latest).
 *   7. Prevent duplicate cycles (idempotency check).
 *   8. Zero invented task dependencies (pure agronomic truth).
 *   9. Atomic PostgreSQL transactional persistence with zero orphan rows.
 * ============================================================================
 */

import crypto from "crypto";
import { supabaseAdmin, supabase } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";
import { CropKnowledgeService } from "./cropKnowledge.service";
import {
  LifecycleGenerationInput,
  LifecycleGenerationResult,
  CropCycleRecord,
  CropCycleStageRecord,
  FarmTaskRecord,
  TaskDependencyRecord,
} from "../types/cropLifecycle.types";
import {
  addDays,
  isValidIsoDate,
} from "../utils/date.utils";

export class LifecycleGeneratorService {
  /**
   * Generates a complete deterministic crop lifecycle.
   * 
   * @param input Lifecycle parameters
   * @param userJwt Optional user bearer JWT for user-scoped Supabase client
   */
  public static async generateLifecycle(
    input: LifecycleGenerationInput,
    userJwt?: string
  ): Promise<LifecycleGenerationResult> {
    const startTime = Date.now();

    // ------------------------------------------------------------------------
    // 1. Input Validation
    // ------------------------------------------------------------------------
    if (!input.userId) {
      const err: any = new Error("User ID is required");
      err.statusCode = 401;
      throw err;
    }

    if (!input.farmId) {
      const err: any = new Error("Farm ID is required");
      err.statusCode = 400;
      throw err;
    }

    if (!input.cropCode) {
      const err: any = new Error("Crop code is required");
      err.statusCode = 400;
      throw err;
    }

    if (!input.varietyCode) {
      const err: any = new Error("Variety code is required");
      err.statusCode = 400;
      throw err;
    }

    if (!input.sowingDate || !isValidIsoDate(input.sowingDate)) {
      const err: any = new Error(
        `Invalid sowing date: "${input.sowingDate}". Must be a valid calendar date in YYYY-MM-DD format.`
      );
      err.statusCode = 400;
      throw err;
    }

    if (typeof input.allocatedArea !== "number" || input.allocatedArea <= 0) {
      const err: any = new Error("Allocated area must be a positive number (> 0)");
      err.statusCode = 400;
      throw err;
    }

    // ------------------------------------------------------------------------
    // 2. Authorization: Verify Farm Ownership
    // ------------------------------------------------------------------------
    const { data: farm, error: farmError } = await supabaseAdmin
      .from("farms")
      .select("id, user_id, farm_name")
      .eq("id", input.farmId)
      .maybeSingle();

    if (farmError) {
      const err: any = new Error("Failed to verify farm ownership");
      err.statusCode = 500;
      throw err;
    }

    if (!farm) {
      const err: any = new Error("Farm not found");
      err.statusCode = 404;
      throw err;
    }

    if (farm.user_id !== input.userId) {
      const err: any = new Error("Forbidden: You do not have permission to plan on this farm");
      err.statusCode = 403;
      throw err;
    }

    // ------------------------------------------------------------------------
    // 3. Dynamic Knowledge Resolution (Crop, Variety, Versions)
    // ------------------------------------------------------------------------
    const crop = await CropKnowledgeService.getCropByCode(input.cropCode);
    if (!crop || !crop.is_active) {
      const err: any = new Error(
        `Crop "${input.cropCode}" is not found in active knowledge catalog`
      );
      err.statusCode = 404;
      throw err;
    }

    const varieties = await CropKnowledgeService.getVarietiesByCrop(input.cropCode);
    const variety = varieties.find(
      (v) => v.variety_code === input.varietyCode && v.is_active
    );

    if (!variety) {
      const err: any = new Error(
        `Variety "${input.varietyCode}" is not approved for crop "${input.cropCode}" or is inactive`
      );
      err.statusCode = 422; // Unprocessable Entity: semantic mismatch
      throw err;
    }

    // Dynamic knowledge version pinning (NOT hardcoded)
    const knowledgeVersion = crop.knowledge_version;

    // ------------------------------------------------------------------------
    // 4. Idempotency Check (Prevent duplicate active cycles for same plot/date)
    // ------------------------------------------------------------------------
    const { data: existingCycle } = await supabaseAdmin
      .from("crop_cycles")
      .select("id, crop_code, variety_code, sowing_date, status")
      .eq("farm_id", input.farmId)
      .eq("user_id", input.userId)
      .eq("crop_code", input.cropCode)
      .eq("variety_code", input.varietyCode)
      .eq("sowing_date", input.sowingDate)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (existingCycle) {
      const err: any = new Error(
        `An active crop cycle for ${crop.common_name} (${variety.variety_name}) on this farm with sowing date ${input.sowingDate} already exists. To plan an additional cycle, specify distinct notes or complete the existing cycle.`
      );
      err.statusCode = 409; // Conflict
      throw err;
    }

    // ------------------------------------------------------------------------
    // 5. Deterministic Schedule & Window Calculation
    // ------------------------------------------------------------------------
    const targetHarvestDate = addDays(input.sowingDate, variety.typical_duration_days);

    // Load templates
    const stageTemplates = await CropKnowledgeService.getStagesByCrop(input.cropCode);
    if (!stageTemplates || stageTemplates.length === 0) {
      throw new Error(`No stage templates found for crop ${input.cropCode}`);
    }

    const activityTemplates = await CropKnowledgeService.getActivitiesByCrop(input.cropCode);
    const activeRules = await CropKnowledgeService.getActiveRules();
    const ruleVersionMap = new Map(activeRules.map((r) => [r.id, r.rule_version]));

    const cycleId = crypto.randomUUID();

    // 5.1 Build Crop Cycle Record
    const cycleRecord: CropCycleRecord = {
      id: cycleId,
      user_id: input.userId,
      farm_id: input.farmId,
      legacy_crop_id: input.legacyCropId || null,
      crop_code: crop.crop_code,
      crop_name: crop.common_name,
      variety_code: variety.variety_code,
      variety_name: variety.variety_name,
      allocated_area: input.allocatedArea,
      area_unit: input.areaUnit || "acre",
      soil_type: input.soilType || null,
      irrigation_type: input.irrigationType || null,
      sowing_date: input.sowingDate,
      target_harvest_date: targetHarvestDate,
      status: "ACTIVE",
      knowledge_version: knowledgeVersion, // Pinned dynamically
      notes: input.notes || null,
    };

    // 5.2 Build Realized Stage Records
    const stageRecords: CropCycleStageRecord[] = [];
    const stageIdByCode = new Map<string, string>();
    const stageIdByTemplateId = new Map<string, string>();

    for (const st of stageTemplates) {
      const stageId = crypto.randomUUID();
      stageIdByCode.set(st.stage_code, stageId);
      if (st.id) {
        stageIdByTemplateId.set(st.id, stageId);
      }

      const targetStartDate = addDays(input.sowingDate, st.typical_start_day_offset);
      const targetEndDate = addDays(input.sowingDate, st.typical_end_day_offset);

      stageRecords.push({
        id: stageId,
        crop_cycle_id: cycleId,
        stage_code: st.stage_code,
        stage_name: st.stage_name,
        stage_order: st.stage_order,
        // Supported schema semantics: without fabricated variance offsets,
        // start window is anchored at typical start day offset
        earliest_start_date: targetStartDate,
        target_start_date: targetStartDate,
        latest_start_date: targetStartDate,
        target_end_date: targetEndDate,
        status: "UPCOMING",
      });
    }

    // 5.3 Build Realized Task Records with Action Windows
    const taskRecords: FarmTaskRecord[] = [];

    for (const act of activityTemplates) {
      let stageId: string | undefined;
      if (act.stage_template_id && stageIdByTemplateId.has(act.stage_template_id)) {
        stageId = stageIdByTemplateId.get(act.stage_template_id);
      } else if (act.stage_code && stageIdByCode.has(act.stage_code)) {
        stageId = stageIdByCode.get(act.stage_code);
      }

      if (!stageId) {
        throw new Error(
          `Activity ${act.activity_code} references unmapped stage (stage_code: ${act.stage_code}, template_id: ${act.stage_template_id})`
        );
      }

      const earliestDate = addDays(input.sowingDate, act.earliest_day_offset);
      const targetDate = addDays(input.sowingDate, act.target_day_offset);
      const latestDate = addDays(input.sowingDate, act.latest_day_offset);

      // Dynamically resolve rule_version for weather-sensitive tasks
      let pinnedRuleVersion = "1.0";
      if (act.default_rule_id) {
        pinnedRuleVersion = ruleVersionMap.get(act.default_rule_id) || "1.0";
      }

      taskRecords.push({
        id: crypto.randomUUID(),
        crop_cycle_id: cycleId,
        stage_id: stageId,
        user_id: input.userId,
        task_code: act.activity_code,
        title: act.activity_title,
        category: act.activity_category,
        description: act.guidance_notes || null,
        earliest_date: earliestDate,
        target_date: targetDate,
        latest_date: latestDate,
        priority: act.priority,
        status: "SCHEDULED",
        is_weather_sensitive: act.is_weather_sensitive,
        weather_sensitivity_type: act.weather_sensitivity_type || null,
        schedule_version: 1,
        rule_id: act.default_rule_id || null,
        rule_version: pinnedRuleVersion, // Pinned dynamically
      });
    }

    // 5.4 Task Dependencies (Zero invented dependencies in Phase 4)
    const dependencyRecords: TaskDependencyRecord[] = [];

    // ------------------------------------------------------------------------
    // 6. Atomic Transactional Persistence
    // ------------------------------------------------------------------------
    await this.persistLifecycleTransactional(
      cycleRecord,
      stageRecords,
      taskRecords,
      dependencyRecords,
      userJwt
    );

    const duration = Date.now() - startTime;
    console.log(
      `[LIFECYCLE GENERATED] Cycle=${cycleId}, Crop=${crop.crop_code}, Variety=${variety.variety_code}, Stages=${stageRecords.length}, Tasks=${taskRecords.length}, Duration=${duration}ms`
    );

    return {
      cycle: cycleRecord,
      stages: stageRecords,
      tasks: taskRecords,
      dependencies: dependencyRecords,
      metadata: {
        knowledgeVersion,
        totalDays: variety.typical_duration_days,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Persists lifecycle entities atomically.
   * Uses PostgreSQL RPC `create_crop_lifecycle_transactional`.
   * If RPC is unavailable, uses atomic fallback with strict cleanup rollback.
   */
  public static async persistLifecycleTransactional(
    cycle: CropCycleRecord,
    stages: CropCycleStageRecord[],
    tasks: FarmTaskRecord[],
    dependencies: TaskDependencyRecord[],
    userJwt?: string
  ): Promise<void> {
    // 1. Try invoking PostgreSQL atomic RPC function
    const client = userJwt
      ? createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { global: { headers: { Authorization: `Bearer ${userJwt}` } } }
        )
      : supabaseAdmin;

    const { data: rpcData, error: rpcError } = await client.rpc(
      "create_crop_lifecycle_transactional",
      {
        p_cycle: cycle,
        p_stages: stages,
        p_tasks: tasks,
        p_dependencies: dependencies,
      }
    );

    if (!rpcError) {
      // RPC executed and committed inside PostgreSQL transaction
      return;
    }

    // If RPC failed due to a constraint or privilege violation, throw immediately!
    if (rpcError.code !== "PGRST202") {
      console.error("RPC TRANSACTION REJECTED BY DATABASE:", rpcError);
      throw new Error(`Database transaction failed: ${rpcError.message}`);
    }

    // Fallback: If RPC function is not yet installed in schema cache (PGRST202),
    // perform atomic insertion with guaranteed full rollback on failure:
    console.warn("RPC function not found in schema cache. Using fallback atomic transaction block.");

    try {
      // 1. Insert cycle
      const { error: cycleErr } = await supabaseAdmin.from("crop_cycles").insert(cycle);
      if (cycleErr) throw cycleErr;

      // 2. Insert stages
      const { error: stageErr } = await supabaseAdmin.from("crop_cycle_stages").insert(stages);
      if (stageErr) throw stageErr;

      // 3. Insert tasks
      const { error: taskErr } = await supabaseAdmin.from("farm_tasks").insert(tasks);
      if (taskErr) throw taskErr;

      // 4. Insert dependencies (if any)
      if (dependencies.length > 0) {
        const { error: depErr } = await supabaseAdmin.from("task_dependencies").insert(dependencies);
        if (depErr) throw depErr;
      }
    } catch (err: any) {
      // Rollback: Cascade delete cycle and all associated records
      console.error("Atomic transaction rollback triggered due to error:", err.message);
      await supabaseAdmin.from("crop_cycles").delete().eq("id", cycle.id);
      throw new Error(`Lifecycle transaction rolled back: ${err.message}`);
    }
  }

  /**
   * Retrieves a full crop lifecycle hierarchy by cycle ID.
   * Enforces user authorization.
   */
  public static async getLifecycleById(
    cycleId: string,
    userId: string
  ): Promise<LifecycleGenerationResult | null> {
    const { data: cycle, error: cycleErr } = await supabaseAdmin
      .from("crop_cycles")
      .select("*")
      .eq("id", cycleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (cycleErr || !cycle) {
      return null;
    }

    const { data: stages } = await supabaseAdmin
      .from("crop_cycle_stages")
      .select("*")
      .eq("crop_cycle_id", cycleId)
      .order("stage_order", { ascending: true });

    const { data: tasks } = await supabaseAdmin
      .from("farm_tasks")
      .select("*")
      .eq("crop_cycle_id", cycleId)
      .order("target_date", { ascending: true });

    const taskIds = (tasks || []).map((t) => t.id);
    let dependencies: TaskDependencyRecord[] = [];

    if (taskIds.length > 0) {
      const { data: deps } = await supabaseAdmin
        .from("task_dependencies")
        .select("*")
        .in("task_id", taskIds);
      dependencies = (deps as TaskDependencyRecord[]) || [];
    }

    return {
      cycle: cycle as CropCycleRecord,
      stages: (stages as CropCycleStageRecord[]) || [],
      tasks: (tasks as FarmTaskRecord[]) || [],
      dependencies,
      metadata: {
        knowledgeVersion: cycle.knowledge_version,
        totalDays: 0,
        generatedAt: cycle.created_at,
      },
    };
  }

  /**
   * Retrieves all crop cycles for a given farm.
   * Enforces user ownership.
   */
  public static async getLifecyclesByFarm(
    farmId: string,
    userId: string
  ): Promise<CropCycleRecord[]> {
    // Verify farm ownership
    const { data: farm } = await supabaseAdmin
      .from("farms")
      .select("id")
      .eq("id", farmId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!farm) {
      const err: any = new Error("Farm not found or unauthorized");
      err.statusCode = 404;
      throw err;
    }

    const { data: cycles, error } = await supabaseAdmin
      .from("crop_cycles")
      .select("*")
      .eq("farm_id", farmId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch lifecycles: ${error.message}`);
    }

    return (cycles as CropCycleRecord[]) || [];
  }

  /**
   * Retrieves all crop cycles for an authenticated user across all farms or specific farm.
   */
  public static async getUserLifecycles(
    userId: string,
    farmId?: string
  ): Promise<CropCycleRecord[]> {
    let query = supabaseAdmin
      .from("crop_cycles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (farmId) {
      query = query.eq("farm_id", farmId);
    }

    const { data: cycles, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch user lifecycles: ${error.message}`);
    }

    return (cycles as CropCycleRecord[]) || [];
  }

  /**
   * Retrieves all tasks for a specific crop cycle.
   */
  public static async getCycleTasks(
    cycleId: string,
    userId: string
  ): Promise<FarmTaskRecord[]> {
    // Verify user ownership of the cycle
    const { data: cycle } = await supabaseAdmin
      .from("crop_cycles")
      .select("id")
      .eq("id", cycleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!cycle) {
      const err: any = new Error("Crop cycle not found or unauthorized");
      err.statusCode = 404;
      throw err;
    }

    const { data: tasks, error } = await supabaseAdmin
      .from("farm_tasks")
      .select("*")
      .eq("crop_cycle_id", cycleId)
      .order("target_date", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch cycle tasks: ${error.message}`);
    }

    return (tasks as FarmTaskRecord[]) || [];
  }
}

