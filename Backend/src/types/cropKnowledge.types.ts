/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 3: Crop Knowledge & Rule Versioning Domain Types
 * ============================================================================
 * Pure deterministic interfaces for master agricultural knowledge.
 * No AI/LLM models or probabilistic score abstractions.
 * ============================================================================
 */

export interface MasterCropRecord {
  id?: string;
  crop_code: string;
  common_name: string;
  scientific_name?: string;
  season_category: "Kharif" | "Rabi" | "Zaid" | "Year-round";
  source_reference: string;
  knowledge_version: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MasterVarietyRecord {
  id?: string;
  crop_id?: string;
  crop_code?: string;
  variety_code: string;
  variety_name: string;
  typical_duration_days: number;
  min_duration_days: number;
  max_duration_days: number;
  source_reference: string;
  is_active: boolean;
  created_at?: string;
}

export interface MasterStageTemplateRecord {
  id?: string;
  crop_id?: string;
  crop_code?: string;
  stage_code: string;
  stage_name: string;
  stage_order: number;
  typical_start_day_offset: number;
  typical_end_day_offset: number;
  is_critical_monitoring: boolean;
  description?: string;
  created_at?: string;
}

export type ActivityCategory =
  | "SOWING"
  | "IRRIGATION"
  | "NUTRIENT"
  | "PROTECTION"
  | "INSPECTION"
  | "HARVEST"
  | "POST_HARVEST";

export type WeatherSensitivityType =
  | "RAIN_AVOIDANCE"
  | "HIGH_WIND_AVOIDANCE"
  | "SOIL_MOISTURE_CHECK"
  | "SUNNY_WINDOW_REQUIRED";

export type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface MasterActivityTemplateRecord {
  id?: string;
  crop_id?: string;
  crop_code?: string;
  stage_template_id?: string;
  stage_code: string;
  activity_code: string;
  activity_title: string;
  activity_category: ActivityCategory;
  earliest_day_offset: number;
  target_day_offset: number;
  latest_day_offset: number;
  priority: PriorityLevel;
  is_weather_sensitive: boolean;
  weather_sensitivity_type?: WeatherSensitivityType;
  default_rule_id?: string;
  guidance_notes?: string;
  created_at?: string;
}

export type RuleCategory =
  | "IRRIGATION"
  | "SPRAYING"
  | "HARVEST"
  | "FIELD_OPERATION"
  | "RISK_ALERT";

export type RuleActionType =
  | "RESCHEDULE_TASK"
  | "HOLD_FOR_INSPECTION"
  | "EMIT_WARNING"
  | "CONFIRM_READINESS";

export type RuleReviewStatus = "VERIFIED" | "EXPERIMENTAL" | "DEPRECATED";

export interface AgriculturalRuleRecord {
  id: string;
  rule_version: string;
  rule_name: string;
  category: RuleCategory;
  source_citation: string;
  effective_from: string; // ISO Date YYYY-MM-DD
  review_status: RuleReviewStatus;
  condition_expression: Record<string, unknown>;
  action_type: RuleActionType;
  explanation_template: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompleteCropKnowledge {
  crop: MasterCropRecord;
  varieties: MasterVarietyRecord[];
  stages: MasterStageTemplateRecord[];
  activities: MasterActivityTemplateRecord[];
}

export interface KnowledgeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
