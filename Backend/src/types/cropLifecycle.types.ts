/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 4: Crop Lifecycle Domain Types
 * ============================================================================
 * Pure deterministic interfaces for operational crop cycles, stages, tasks,
 * action windows, dependencies, and generation inputs/results.
 * ============================================================================
 */

export type CropCycleStatus =
  | "PLANNED"
  | "ACTIVE"
  | "HARVEST_READY"
  | "HARVESTED"
  | "POST_HARVEST"
  | "COMPLETED"
  | "ABANDONED";

export interface CropCycleRecord {
  id: string;
  user_id: string;
  farm_id: string;
  legacy_crop_id?: string | null;
  crop_code: string;
  crop_name: string;
  variety_code?: string | null;
  variety_name?: string | null;
  allocated_area: number;
  area_unit: string;
  soil_type?: string | null;
  irrigation_type?: string | null;
  sowing_date: string; // ISO date YYYY-MM-DD
  target_harvest_date: string; // ISO date YYYY-MM-DD
  actual_harvest_date?: string | null;
  cycle_completion_date?: string | null;
  status: CropCycleStatus;
  knowledge_version: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CropCycleStageStatus =
  | "UPCOMING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELAYED";

export interface CropCycleStageRecord {
  id: string;
  crop_cycle_id: string;
  stage_code: string;
  stage_name: string;
  stage_order: number;
  earliest_start_date: string; // ISO date YYYY-MM-DD
  target_start_date: string; // ISO date YYYY-MM-DD
  latest_start_date: string; // ISO date YYYY-MM-DD
  target_end_date: string; // ISO date YYYY-MM-DD
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  status: CropCycleStageStatus;
  created_at?: string;
  updated_at?: string;
}

export type TaskCategory =
  | "SOWING"
  | "IRRIGATION"
  | "NUTRIENT"
  | "PROTECTION"
  | "INSPECTION"
  | "HARVEST"
  | "POST_HARVEST";

export type TaskPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type TaskStatus =
  | "SCHEDULED"
  | "PENDING_ACTION"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "POSTPONED"
  | "SKIPPED"
  | "UNABLE_TO_COMPLETE"
  | "CANCELLED";

export type WeatherSensitivityType =
  | "RAIN_AVOIDANCE"
  | "HIGH_WIND_AVOIDANCE"
  | "SOIL_MOISTURE_CHECK"
  | "SUNNY_WINDOW_REQUIRED";

export interface FarmTaskRecord {
  id: string;
  crop_cycle_id: string;
  stage_id: string;
  user_id: string;
  task_code: string;
  title: string;
  category: TaskCategory;
  description?: string | null;
  earliest_date: string; // ISO date YYYY-MM-DD (Action window start)
  target_date: string; // ISO date YYYY-MM-DD (Recommended target)
  latest_date: string; // ISO date YYYY-MM-DD (Action window end)
  priority: TaskPriority;
  status: TaskStatus;
  is_weather_sensitive: boolean;
  weather_sensitivity_type?: WeatherSensitivityType | null;
  schedule_version: number;
  rule_id?: string | null;
  rule_version: string;
  created_at?: string;
  updated_at?: string;
}

export type DependencyType = "FINISH_TO_START" | "START_TO_START";

export interface TaskDependencyRecord {
  id?: string;
  task_id: string;
  prerequisite_task_id: string;
  dependency_type: DependencyType;
  min_lag_days: number;
  created_at?: string;
}

export interface LifecycleGenerationInput {
  userId: string;
  farmId: string;
  cropCode: string;
  varietyCode: string;
  sowingDate: string; // ISO date YYYY-MM-DD
  allocatedArea: number;
  areaUnit?: string;
  soilType?: string;
  irrigationType?: string;
  notes?: string;
  legacyCropId?: string;
}

export interface LifecycleGenerationResult {
  cycle: CropCycleRecord;
  stages: CropCycleStageRecord[];
  tasks: FarmTaskRecord[];
  dependencies: TaskDependencyRecord[];
  metadata: {
    knowledgeVersion: string;
    totalDays: number;
    generatedAt: string;
  };
}
