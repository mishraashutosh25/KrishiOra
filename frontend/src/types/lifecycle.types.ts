export interface CropKnowledge {
  id: string;
  crop_code: string;
  common_name: string;
  scientific_name?: string;
  season_category: 'Kharif' | 'Rabi' | 'Zaid' | 'Year-round';
  source_reference: string;
  knowledge_version: string;
  is_active: boolean;
}

export interface CropVariety {
  id: string;
  crop_id: string;
  variety_code: string;
  variety_name: string;
  typical_duration_days: number;
  min_duration_days: number;
  max_duration_days: number;
  source_reference: string;
  is_active: boolean;
}

export interface CropCycle {
  id: string;
  user_id: string;
  farm_id: string;
  crop_code: string;
  crop_name: string;
  variety_code?: string;
  variety_name?: string;
  allocated_area: number;
  area_unit: string;
  soil_type?: string;
  irrigation_type?: string;
  sowing_date: string;
  target_harvest_date: string;
  actual_harvest_date?: string;
  cycle_completion_date?: string;
  status: 'PLANNED' | 'ACTIVE' | 'HARVEST_READY' | 'HARVESTED' | 'POST_HARVEST' | 'COMPLETED' | 'ABANDONED';
  knowledge_version: string;
  notes?: string;
  created_at: string;
}

export interface CropStage {
  id: string;
  crop_cycle_id: string;
  stage_code: string;
  stage_name: string;
  stage_order: number;
  earliest_start_date: string;
  target_start_date: string;
  latest_start_date: string;
  target_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}

export interface FarmTask {
  id: string;
  crop_cycle_id: string;
  stage_id: string;
  user_id: string;
  task_code: string;
  title: string;
  category: 'SOWING' | 'IRRIGATION' | 'NUTRIENT' | 'PROTECTION' | 'INSPECTION' | 'HARVEST' | 'POST_HARVEST';
  description?: string;
  earliest_date: string;
  target_date: string;
  latest_date: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'SCHEDULED' | 'PENDING_ACTION' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED' | 'SKIPPED' | 'UNABLE_TO_COMPLETE' | 'CANCELLED';
  is_weather_sensitive: boolean;
  weather_sensitivity_type?: string;
  schedule_version: number;
  rule_id?: string;
  rule_version?: string;
}

export interface CropProgressResponse {
  cycle_id: string;
  status: string;
  sowing_date: string;
  target_harvest_date: string;
  actual_harvest_date?: string;
  completion_percentage: number;
  operational_projected_harvest_date: string;
  drift_days: number;
  stages: CropStage[];
  disclaimer: string;
}

export interface CropStageTemplate {
  id: string;
  crop_id: string;
  stage_code: string;
  stage_name: string;
  stage_order: number;
  typical_start_day_offset: number;
  typical_end_day_offset: number;
  is_critical_monitoring?: boolean;
  description?: string;
}

export interface GenerateCycleInput {
  farm_id: string;
  crop_code: string;
  variety_code: string;
  sowing_date: string;
  allocated_area: number;
  area_unit?: string;
  soil_type?: string;
  irrigation_type?: string;
  notes?: string;
}

export type CreateCropCyclePayload = GenerateCycleInput;

export interface ExecuteActivityInput {
  action_taken: string;
  action_date: string;
  status: 'COMPLETED' | 'POSTPONED' | 'SKIPPED' | 'UNABLE_TO_COMPLETE';
  reason_code?: string;
  farmer_notes?: string;
  idempotency_key?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  crop_cycle_id: string;
  task_id?: string;
  idempotency_key: string;
  type: 'TASK_REMINDER' | 'WEATHER_ADVISORY' | 'HARVEST_READINESS' | 'RISK_ALERT';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  title: string;
  message: string;
  scheduled_for: string;
  status: 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED' | 'CANCELLED';
  read_at?: string;
  actioned_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
