/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 3: Authoritative Crop Knowledge & Rule Versioning Service
 * ============================================================================
 * Pure deterministic, explainable agronomic service.
 * Zero AI / LLM calls. No probabilistic predictions.
 * Enforces strict validation, authoritative source traceability, and
 * immutable historical rule versioning.
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import {
  MasterCropRecord,
  MasterVarietyRecord,
  MasterStageTemplateRecord,
  MasterActivityTemplateRecord,
  AgriculturalRuleRecord,
  CompleteCropKnowledge,
  KnowledgeValidationResult,
} from "../types/cropKnowledge.types";
import {
  ALL_CROPS_KNOWLEDGE,
  ACTIVE_AGRICULTURAL_RULES,
  HISTORICAL_RULE_VERSIONS,
} from "../data/cropKnowledge";

export class CropKnowledgeService {
  /**
   * ==========================================================================
   * 1. DETERMINISTIC VALIDATION ENGINE
   * ==========================================================================
   */

  /**
   * Validates a complete crop knowledge bundle against agronomic rules and constraints.
   */
  public static validateCropKnowledge(
    knowledge: CompleteCropKnowledge
  ): KnowledgeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { crop, varieties, stages, activities } = knowledge;

    // 1. Crop Root Validation
    if (!crop.crop_code || crop.crop_code.trim() === "") {
      errors.push("Crop code is mandatory.");
    }
    if (!crop.common_name || crop.common_name.trim() === "") {
      errors.push("Crop common name is mandatory.");
    }
    if (!crop.source_reference || crop.source_reference.trim() === "") {
      errors.push("Crop record requires an authoritative source citation.");
    } else if (
      crop.source_reference.toLowerCase().includes("best practice") &&
      !crop.source_reference.toLowerCase().includes("icar") &&
      !crop.source_reference.toLowerCase().includes("university")
    ) {
      warnings.push("Crop citation appears generic; prefer specific institute/bulletin citations.");
    }
    if (!crop.knowledge_version || crop.knowledge_version.trim() === "") {
      errors.push("Knowledge version is mandatory.");
    }

    // 2. Variety Validations
    if (!varieties || varieties.length === 0) {
      errors.push(`Crop ${crop.crop_code} must define at least one approved variety.`);
    } else {
      const varietyCodes = new Set<string>();
      for (const v of varieties) {
        if (varietyCodes.has(v.variety_code)) {
          errors.push(`Duplicate variety code detected: ${v.variety_code}`);
        }
        varietyCodes.add(v.variety_code);

        // Min <= Typical <= Max validation
        if (v.min_duration_days <= 0 || v.typical_duration_days <= 0 || v.max_duration_days <= 0) {
          errors.push(
            `Variety ${v.variety_code} duration values must be positive integers (> 0).`
          );
        }
        if (
          v.min_duration_days > v.typical_duration_days ||
          v.typical_duration_days > v.max_duration_days
        ) {
          errors.push(
            `Variety ${v.variety_code} duration constraint violated: min (${v.min_duration_days}) <= typical (${v.typical_duration_days}) <= max (${v.max_duration_days}) required.`
          );
        }

        // Citation requirement
        if (!v.source_reference || v.source_reference.trim() === "") {
          errors.push(`Variety ${v.variety_code} requires an authoritative source citation.`);
        }
      }
    }

    // 3. Stage Validations
    if (!stages || stages.length === 0) {
      errors.push(`Crop ${crop.crop_code} must define lifecycle stages.`);
    } else {
      const stageCodes = new Set<string>();
      const stageOrders = new Set<number>();
      let previousEnd = -1;

      // Sort copies by stage_order to verify sequence
      const sortedStages = [...stages].sort((a, b) => a.stage_order - b.stage_order);

      for (let i = 0; i < sortedStages.length; i++) {
        const s = sortedStages[i];

        if (stageCodes.has(s.stage_code)) {
          errors.push(`Duplicate stage code detected: ${s.stage_code}`);
        }
        stageCodes.add(s.stage_code);

        if (stageOrders.has(s.stage_order)) {
          errors.push(`Duplicate stage order detected: ${s.stage_order}`);
        }
        stageOrders.add(s.stage_order);

        // Sequence monotonicity: orders must be sequential starting at 1
        if (s.stage_order !== i + 1) {
          errors.push(
            `Stage ordering gap or non-monotonic sequence: expected stage_order ${i + 1} but got ${s.stage_order} for stage ${s.stage_code}.`
          );
        }

        // Offset sanity
        if (s.typical_start_day_offset < 0 || s.typical_end_day_offset < 0) {
          errors.push(`Stage ${s.stage_code} offsets cannot be negative.`);
        }
        if (s.typical_start_day_offset > s.typical_end_day_offset) {
          errors.push(
            `Stage ${s.stage_code} offset violation: typical_start (${s.typical_start_day_offset}) must be <= typical_end (${s.typical_end_day_offset}).`
          );
        }

        // Offset progression
        if (s.typical_start_day_offset < previousEnd && i > 0) {
          warnings.push(
            `Stage ${s.stage_code} start offset (${s.typical_start_day_offset}) overlaps preceding stage end offset (${previousEnd}).`
          );
        }
        previousEnd = s.typical_end_day_offset;
      }
    }

    // 4. Activity Validations
    if (!activities || activities.length === 0) {
      errors.push(`Crop ${crop.crop_code} must define activities.`);
    } else {
      const stageCodeSet = new Set(stages.map((s) => s.stage_code));
      const activityCodes = new Set<string>();

      for (const a of activities) {
        if (activityCodes.has(a.activity_code)) {
          errors.push(`Duplicate activity code detected: ${a.activity_code}`);
        }
        activityCodes.add(a.activity_code);

        // Stage association check
        if (!stageCodeSet.has(a.stage_code)) {
          errors.push(
            `Activity ${a.activity_code} references nonexistent stage ${a.stage_code} in crop ${crop.crop_code}.`
          );
        }

        // Window sanity: earliest <= target <= latest
        if (
          a.earliest_day_offset < 0 ||
          a.target_day_offset < 0 ||
          a.latest_day_offset < 0
        ) {
          errors.push(`Activity ${a.activity_code} offsets cannot be negative.`);
        }
        if (
          a.earliest_day_offset > a.target_day_offset ||
          a.target_day_offset > a.latest_day_offset
        ) {
          errors.push(
            `Activity ${a.activity_code} window constraint violated: earliest (${a.earliest_day_offset}) <= target (${a.target_day_offset}) <= latest (${a.latest_day_offset}) required.`
          );
        }

        // Weather sensitivity validation
        if (a.is_weather_sensitive && !a.weather_sensitivity_type) {
          errors.push(
            `Activity ${a.activity_code} is flagged weather-sensitive but lacks weather_sensitivity_type.`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates an agricultural rule record.
   */
  public static validateAgriculturalRule(
    rule: AgriculturalRuleRecord
  ): KnowledgeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rule.id || rule.id.trim() === "") {
      errors.push("Rule ID is mandatory.");
    }
    if (!rule.rule_version || rule.rule_version.trim() === "") {
      errors.push("Rule version is mandatory.");
    }
    if (!rule.source_citation || rule.source_citation.trim() === "") {
      errors.push(`Rule ${rule.id} requires an authoritative source citation.`);
    }
    if (!rule.condition_expression || typeof rule.condition_expression !== "object") {
      errors.push(`Rule ${rule.id} condition_expression must be a non-empty object.`);
    }
    if (!rule.explanation_template || rule.explanation_template.trim() === "") {
      errors.push(`Rule ${rule.id} requires an explanation template.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * ==========================================================================
   * 2. DATABASE & HYBRID RETRIEVAL API
   * ==========================================================================
   */

  /**
   * Retrieves an active crop by crop_code from Supabase database.
   * If inactive or nonexistent, returns null.
   */
  public static async getCropByCode(
    cropCode: string
  ): Promise<MasterCropRecord | null> {
    const { data, error } = await supabaseAdmin
      .from("crop_knowledge_catalog")
      .select("*")
      .eq("crop_code", cropCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      // Check fallback in memory catalog
      const fallback = ALL_CROPS_KNOWLEDGE.find(
        (k) => k.crop.crop_code === cropCode && k.crop.is_active
      );
      return fallback ? fallback.crop : null;
    }

    return data as MasterCropRecord;
  }

  /**
   * Retrieves all currently active crops.
   */
  public static async getActiveCrops(): Promise<MasterCropRecord[]> {
    const { data, error } = await supabaseAdmin
      .from("crop_knowledge_catalog")
      .select("*")
      .eq("is_active", true)
      .order("common_name", { ascending: true });

    if (error || !data || data.length === 0) {
      return ALL_CROPS_KNOWLEDGE.filter((k) => k.crop.is_active).map(
        (k) => k.crop
      );
    }

    return data as MasterCropRecord[];
  }

  /**
   * Retrieves approved varieties for a crop.
   */
  public static async getVarietiesByCrop(
    cropCode: string
  ): Promise<MasterVarietyRecord[]> {
    // 1. Resolve crop_id
    const crop = await this.getCropByCode(cropCode);
    if (!crop) return [];

    if (crop.id) {
      const { data, error } = await supabaseAdmin
        .from("crop_variety_catalog")
        .select("*")
        .eq("crop_id", crop.id)
        .eq("is_active", true)
        .order("variety_name", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as MasterVarietyRecord[];
      }
    }

    // Fallback to memory
    const catalog = ALL_CROPS_KNOWLEDGE.find(
      (k) => k.crop.crop_code === cropCode
    );
    return catalog ? catalog.varieties.filter((v) => v.is_active) : [];
  }

  /**
   * Retrieves ordered growth stage templates for a crop.
   */
  public static async getStagesByCrop(
    cropCode: string
  ): Promise<MasterStageTemplateRecord[]> {
    const crop = await this.getCropByCode(cropCode);
    if (!crop) return [];

    if (crop.id) {
      const { data, error } = await supabaseAdmin
        .from("crop_stage_templates")
        .select("*")
        .eq("crop_id", crop.id)
        .order("stage_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as MasterStageTemplateRecord[];
      }
    }

    // Fallback to memory
    const catalog = ALL_CROPS_KNOWLEDGE.find(
      (k) => k.crop.crop_code === cropCode
    );
    return catalog ? [...catalog.stages].sort((a, b) => a.stage_order - b.stage_order) : [];
  }

  /**
   * Retrieves activity templates for a crop.
   */
  public static async getActivitiesByCrop(
    cropCode: string
  ): Promise<MasterActivityTemplateRecord[]> {
    const crop = await this.getCropByCode(cropCode);
    if (!crop) return [];

    if (crop.id) {
      const { data, error } = await supabaseAdmin
        .from("crop_activity_templates")
        .select("*, crop_stage_templates(stage_code)")
        .eq("crop_id", crop.id)
        .order("target_day_offset", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          ...d,
          stage_code: d.stage_code || d.crop_stage_templates?.stage_code,
        })) as MasterActivityTemplateRecord[];
      }
    }

    // Fallback to memory
    const catalog = ALL_CROPS_KNOWLEDGE.find(
      (k) => k.crop.crop_code === cropCode
    );
    return catalog ? catalog.activities : [];
  }

  /**
   * Retrieves an agricultural rule by ID and exact version.
   * If version is omitted, retrieves the active verified version.
   * Supports historical rule version retrieval for explainability audit trails.
   */
  public static async getRuleByIdAndVersion(
    ruleId: string,
    version?: string
  ): Promise<AgriculturalRuleRecord | null> {
    // 1. Try querying agricultural_rules table in Supabase
    let query = supabaseAdmin.from("agricultural_rules").select("*").eq("id", ruleId);

    if (version) {
      query = query.eq("rule_version", version);
    } else {
      query = query.eq("review_status", "VERIFIED");
    }

    const { data, error } = await query.maybeSingle();
    if (!error && data) {
      return data as AgriculturalRuleRecord;
    }

    // 2. Query historical / version registry
    const matched = HISTORICAL_RULE_VERSIONS.find((r) => {
      if (r.id !== ruleId) return false;
      if (version) {
        return r.rule_version === version;
      }
      return r.review_status === "VERIFIED";
    });

    return matched || null;
  }

  /**
   * Retrieves all currently active and verified agricultural rules.
   */
  public static async getActiveRules(): Promise<AgriculturalRuleRecord[]> {
    const { data, error } = await supabaseAdmin
      .from("agricultural_rules")
      .select("*")
      .eq("review_status", "VERIFIED")
      .order("id", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as AgriculturalRuleRecord[];
    }

    return ACTIVE_AGRICULTURAL_RULES.filter(
      (r) => r.review_status === "VERIFIED"
    );
  }
}
