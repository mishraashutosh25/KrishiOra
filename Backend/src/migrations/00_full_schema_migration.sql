-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Consolidated Production Schema Migration (Phase 2)
-- ============================================================================
-- Safety: Non-destructive.
-- Existing tables (farms, crops, expenses, profiles, password_reset_otps) 
-- and all live user data remain 100% intact and untouched.
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: Master Agricultural Knowledge Catalogs (Reference Plane)
-- ============================================================================

CREATE TABLE IF NOT EXISTS crop_knowledge_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_code VARCHAR(50) UNIQUE NOT NULL,
    common_name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(100),
    season_category VARCHAR(20) NOT NULL CHECK (season_category IN ('Kharif', 'Rabi', 'Zaid', 'Year-round')),
    source_reference TEXT NOT NULL,
    knowledge_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_variety_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES crop_knowledge_catalog(id) ON DELETE RESTRICT,
    variety_code VARCHAR(50) NOT NULL,
    variety_name VARCHAR(100) NOT NULL,
    typical_duration_days INTEGER NOT NULL CHECK (typical_duration_days > 0),
    min_duration_days INTEGER NOT NULL,
    max_duration_days INTEGER NOT NULL,
    source_reference TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_variety_duration CHECK (min_duration_days <= typical_duration_days AND typical_duration_days <= max_duration_days),
    CONSTRAINT uq_crop_variety UNIQUE (crop_id, variety_code)
);

CREATE TABLE IF NOT EXISTS crop_stage_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES crop_knowledge_catalog(id) ON DELETE CASCADE,
    stage_code VARCHAR(50) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    typical_start_day_offset INTEGER NOT NULL,
    typical_end_day_offset INTEGER NOT NULL,
    is_critical_monitoring BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_crop_stage_order UNIQUE (crop_id, stage_order),
    CONSTRAINT uq_crop_stage_code UNIQUE (crop_id, stage_code),
    CONSTRAINT chk_stage_offsets CHECK (typical_start_day_offset <= typical_end_day_offset)
);

CREATE TABLE IF NOT EXISTS crop_activity_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES crop_knowledge_catalog(id) ON DELETE CASCADE,
    stage_template_id UUID NOT NULL REFERENCES crop_stage_templates(id) ON DELETE CASCADE,
    activity_code VARCHAR(50) NOT NULL,
    activity_title VARCHAR(150) NOT NULL,
    activity_category VARCHAR(50) NOT NULL CHECK (activity_category IN ('SOWING', 'IRRIGATION', 'NUTRIENT', 'PROTECTION', 'INSPECTION', 'HARVEST', 'POST_HARVEST')),
    earliest_day_offset INTEGER NOT NULL,
    target_day_offset INTEGER NOT NULL,
    latest_day_offset INTEGER NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    is_weather_sensitive BOOLEAN NOT NULL DEFAULT false,
    weather_sensitivity_type VARCHAR(50) CHECK (weather_sensitivity_type IN ('RAIN_AVOIDANCE', 'HIGH_WIND_AVOIDANCE', 'SOIL_MOISTURE_CHECK', 'SUNNY_WINDOW_REQUIRED')),
    default_rule_id VARCHAR(50),
    guidance_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_activity_offsets CHECK (earliest_day_offset <= target_day_offset AND target_day_offset <= latest_day_offset),
    CONSTRAINT uq_crop_activity_code UNIQUE (crop_id, activity_code)
);

CREATE TABLE IF NOT EXISTS agricultural_rules (
    id VARCHAR(50) PRIMARY KEY,
    rule_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    rule_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('IRRIGATION', 'SPRAYING', 'HARVEST', 'FIELD_OPERATION', 'RISK_ALERT')),
    source_citation TEXT NOT NULL,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    review_status VARCHAR(20) NOT NULL DEFAULT 'VERIFIED' CHECK (review_status IN ('VERIFIED', 'EXPERIMENTAL', 'DEPRECATED')),
    condition_expression JSONB NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('RESCHEDULE_TASK', 'HOLD_FOR_INSPECTION', 'EMIT_WARNING', 'CONFIRM_READINESS')),
    explanation_template TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 2: Operational Planning Tables & Constraints
-- ============================================================================

CREATE TABLE IF NOT EXISTS crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE RESTRICT,
    legacy_crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    
    crop_code VARCHAR(50) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    variety_code VARCHAR(50),
    variety_name VARCHAR(100),
    allocated_area NUMERIC(10, 2) NOT NULL CHECK (allocated_area > 0),
    area_unit VARCHAR(20) NOT NULL DEFAULT 'acre',
    soil_type VARCHAR(50),
    irrigation_type VARCHAR(50),
    
    sowing_date DATE NOT NULL,
    target_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    cycle_completion_date DATE,
    
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('PLANNED', 'ACTIVE', 'HARVEST_READY', 'HARVESTED', 'POST_HARVEST', 'COMPLETED', 'ABANDONED')),
    knowledge_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_harvest_after_sowing CHECK (target_harvest_date >= sowing_date),
    CONSTRAINT uq_crop_cycles_id_user UNIQUE (id, user_id)
);

CREATE TABLE IF NOT EXISTS crop_cycle_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
    stage_code VARCHAR(50) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    
    earliest_start_date DATE NOT NULL,
    target_start_date DATE NOT NULL,
    latest_start_date DATE NOT NULL,
    target_end_date DATE NOT NULL,
    
    actual_start_date DATE,
    actual_end_date DATE,
    
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING'
        CHECK (status IN ('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_cycle_stage_order UNIQUE (crop_cycle_id, stage_order),
    CONSTRAINT uq_crop_stages_id_cycle UNIQUE (id, crop_cycle_id),
    CONSTRAINT chk_stage_dates CHECK (earliest_start_date <= target_start_date AND target_start_date <= latest_start_date)
);

CREATE TABLE IF NOT EXISTS farm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID NOT NULL,
    stage_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    task_code VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('SOWING', 'IRRIGATION', 'NUTRIENT', 'PROTECTION', 'INSPECTION', 'HARVEST', 'POST_HARVEST')),
    description TEXT,
    
    earliest_date DATE NOT NULL,
    target_date DATE NOT NULL,
    latest_date DATE NOT NULL,
    
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED' 
        CHECK (status IN ('SCHEDULED', 'PENDING_ACTION', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'SKIPPED', 'UNABLE_TO_COMPLETE', 'CANCELLED')),
    
    is_weather_sensitive BOOLEAN NOT NULL DEFAULT false,
    weather_sensitivity_type VARCHAR(50) CHECK (weather_sensitivity_type IN ('RAIN_AVOIDANCE', 'HIGH_WIND_AVOIDANCE', 'SOIL_MOISTURE_CHECK', 'SUNNY_WINDOW_REQUIRED')),
    
    schedule_version INTEGER NOT NULL DEFAULT 1,
    rule_id VARCHAR(50) REFERENCES agricultural_rules(id) ON DELETE SET NULL,
    rule_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_task_window CHECK (earliest_date <= target_date AND target_date <= latest_date),
    CONSTRAINT fk_farm_tasks_cycle_user FOREIGN KEY (crop_cycle_id, user_id) 
        REFERENCES crop_cycles (id, user_id) ON DELETE CASCADE,
    CONSTRAINT fk_farm_tasks_stage_cycle FOREIGN KEY (stage_id, crop_cycle_id) 
        REFERENCES crop_cycle_stages (id, crop_cycle_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES farm_tasks(id) ON DELETE CASCADE,
    prerequisite_task_id UUID NOT NULL REFERENCES farm_tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(30) NOT NULL DEFAULT 'FINISH_TO_START' CHECK (dependency_type IN ('FINISH_TO_START', 'START_TO_START')),
    min_lag_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_task_dependency UNIQUE (task_id, prerequisite_task_id),
    CONSTRAINT chk_no_self_dependency CHECK (task_id <> prerequisite_task_id)
);

CREATE OR REPLACE FUNCTION trg_check_task_dependency_cycle()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        WITH RECURSIVE dependency_chain AS (
            SELECT prerequisite_task_id AS current_prereq
            FROM task_dependencies
            WHERE task_id = NEW.prerequisite_task_id
            
            UNION
            
            SELECT td.prerequisite_task_id
            FROM task_dependencies td
            JOIN dependency_chain dc ON td.task_id = dc.current_prereq
        )
        SELECT 1 FROM dependency_chain WHERE current_prereq = NEW.task_id
    ) THEN
        RAISE EXCEPTION 'Circular dependency detected: Task % cannot depend on % because a dependency path already exists in reverse.', 
            NEW.task_id, NEW.prerequisite_task_id 
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_circular_dependencies ON task_dependencies;
CREATE TRIGGER trg_prevent_circular_dependencies
    BEFORE INSERT OR UPDATE ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION trg_check_task_dependency_cycle();

-- ============================================================================
-- SECTION 3: Reality, Context & History Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS weather_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE RESTRICT,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    
    forecast_date DATE NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    rainfall_mm NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    rain_probability_pct INTEGER NOT NULL CHECK (rain_probability_pct BETWEEN 0 AND 100),
    temp_max_c NUMERIC(4, 1) NOT NULL,
    temp_min_c NUMERIC(4, 1) NOT NULL,
    humidity_pct INTEGER CHECK (humidity_pct BETWEEN 0 AND 100),
    wind_speed_kmh NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    condition_code VARCHAR(50) NOT NULL,
    
    data_source VARCHAR(50) NOT NULL DEFAULT 'OPEN_METEO',
    is_stale BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_farm_forecast_date UNIQUE (farm_id, forecast_date, data_source)
);

CREATE TABLE IF NOT EXISTS task_schedule_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES farm_tasks(id) ON DELETE RESTRICT,
    schedule_version INTEGER NOT NULL,
    
    previous_earliest_date DATE NOT NULL,
    previous_target_date DATE NOT NULL,
    previous_latest_date DATE NOT NULL,
    
    new_earliest_date DATE NOT NULL,
    new_target_date DATE NOT NULL,
    new_latest_date DATE NOT NULL,
    
    change_trigger VARCHAR(50) NOT NULL CHECK (change_trigger IN ('INITIAL_PLAN', 'WEATHER_ADAPTATION', 'FARMER_OVERRIDE', 'STAGE_DRIFT', 'DEPENDENCY_SHIFT')),
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('SYSTEM_RULE', 'FARMER')),
    change_reason TEXT NOT NULL,
    
    rule_id VARCHAR(50) REFERENCES agricultural_rules(id) ON DELETE SET NULL,
    rule_version VARCHAR(20),
    weather_snapshot_id UUID REFERENCES weather_snapshots(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_task_schedule_version UNIQUE (task_id, schedule_version)
);

CREATE OR REPLACE FUNCTION trg_reject_history_mutations()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Immutability violation: task_schedule_history records can never be updated or deleted.'
        USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_schedule_history_update ON task_schedule_history;
CREATE TRIGGER trg_protect_schedule_history_update
    BEFORE UPDATE OR DELETE ON task_schedule_history
    FOR EACH ROW
    EXECUTE FUNCTION trg_reject_history_mutations();

CREATE TABLE IF NOT EXISTS field_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID NOT NULL,
    task_id UUID REFERENCES farm_tasks(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    
    action_taken VARCHAR(100) NOT NULL,
    action_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('COMPLETED', 'POSTPONED', 'SKIPPED', 'UNABLE_TO_COMPLETE')),
    reason_code VARCHAR(50) CHECK (reason_code IN ('RAIN_INTERFERENCE', 'SOIL_TOO_WET', 'LABOUR_UNAVAILABLE', 'WATER_SHORTAGE', 'EQUIPMENT_BREAKDOWN', 'OBSERVED_READY_EARLY', 'OTHER')),
    farmer_notes TEXT,
    metadata JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_field_activity_cycle_user FOREIGN KEY (crop_cycle_id, user_id)
        REFERENCES crop_cycles (id, user_id) ON DELETE RESTRICT
);

-- ============================================================================
-- SECTION 4: Decision Logs & Notification Delivery Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS decision_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE RESTRICT,
    task_id UUID REFERENCES farm_tasks(id) ON DELETE SET NULL,
    weather_snapshot_id UUID REFERENCES weather_snapshots(id) ON DELETE SET NULL,
    
    rule_id VARCHAR(50) REFERENCES agricultural_rules(id) ON DELETE RESTRICT,
    rule_version VARCHAR(20) NOT NULL,
    
    evaluation_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('NO_CHANGE', 'RESCHEDULE', 'INSPECTION_REQUIRED', 'WEATHER_AFFECTED', 'WEATHER_UNAVAILABLE', 'KNOWLEDGE_UNAVAILABLE')),
    human_explanation TEXT NOT NULL,
    input_context JSONB NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trg_reject_decision_mutations()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Immutability violation: decision_logs records are permanent audit evidence and cannot be updated or deleted.'
        USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_decision_logs_update ON decision_logs;
CREATE TRIGGER trg_protect_decision_logs_update
    BEFORE UPDATE OR DELETE ON decision_logs
    FOR EACH ROW
    EXECUTE FUNCTION trg_reject_decision_mutations();

CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    crop_cycle_id UUID NOT NULL,
    task_id UUID REFERENCES farm_tasks(id) ON DELETE SET NULL,
    
    idempotency_key VARCHAR(200) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('TASK_REMINDER', 'WEATHER_ADVISORY', 'HARVEST_READINESS', 'RISK_ALERT')),
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('CRITICAL', 'HIGH', 'NORMAL', 'LOW')),
    
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    
    CONSTRAINT fk_notification_cycle_user FOREIGN KEY (crop_cycle_id, user_id)
        REFERENCES crop_cycles (id, user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notification_queue(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE')),
    response_payload JSONB,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trg_reject_attempt_mutations()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Immutability violation: notification_attempts records cannot be updated or deleted.'
        USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_notification_attempts ON notification_attempts;
CREATE TRIGGER trg_protect_notification_attempts
    BEFORE UPDATE OR DELETE ON notification_attempts
    FOR EACH ROW
    EXECUTE FUNCTION trg_reject_attempt_mutations();

-- ============================================================================
-- SECTION 5: Targeted High-Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_crop_cycles_user_status 
    ON crop_cycles (user_id, status);

CREATE INDEX IF NOT EXISTS idx_cycle_stages_order 
    ON crop_cycle_stages (crop_cycle_id, stage_order);

CREATE INDEX IF NOT EXISTS idx_farm_tasks_cycle_target_status 
    ON farm_tasks (crop_cycle_id, target_date, status);

CREATE INDEX IF NOT EXISTS idx_farm_tasks_user_status_target 
    ON farm_tasks (user_id, status, target_date);

CREATE INDEX IF NOT EXISTS idx_farm_tasks_weather_eval 
    ON farm_tasks (crop_cycle_id, status) 
    WHERE is_weather_sensitive = true AND status IN ('SCHEDULED', 'PENDING_ACTION');

CREATE INDEX IF NOT EXISTS idx_schedule_history_task_version 
    ON task_schedule_history (task_id, schedule_version DESC);

CREATE INDEX IF NOT EXISTS idx_field_activity_cycle_date 
    ON field_activity_logs (crop_cycle_id, action_date DESC);

CREATE INDEX IF NOT EXISTS idx_weather_snapshots_farm_date 
    ON weather_snapshots (farm_id, forecast_date DESC);

CREATE INDEX IF NOT EXISTS idx_decision_logs_cycle_time 
    ON decision_logs (crop_cycle_id, evaluation_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_notification_queue_worker 
    ON notification_queue (status, priority, scheduled_for) 
    WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_notification_attempts_lookup 
    ON notification_attempts (notification_id, attempt_number);

-- ============================================================================
-- SECTION 6: Restrictive Granular Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE crop_knowledge_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_variety_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_stage_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agricultural_rules ENABLE ROW LEVEL SECURITY;

ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycle_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_schedule_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_attempts ENABLE ROW LEVEL SECURITY;

-- 1. Master Knowledge (Read-only to Authenticated Farmers)
DROP POLICY IF EXISTS "Authenticated users can read active crop catalog" ON crop_knowledge_catalog;
CREATE POLICY "Authenticated users can read active crop catalog" 
    ON crop_knowledge_catalog FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can read active variety catalog" ON crop_variety_catalog;
CREATE POLICY "Authenticated users can read active variety catalog" 
    ON crop_variety_catalog FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can read stage templates" ON crop_stage_templates;
CREATE POLICY "Authenticated users can read stage templates" 
    ON crop_stage_templates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read activity templates" ON crop_activity_templates;
CREATE POLICY "Authenticated users can read activity templates" 
    ON crop_activity_templates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read agricultural rules" ON agricultural_rules;
CREATE POLICY "Authenticated users can read agricultural rules" 
    ON agricultural_rules FOR SELECT TO authenticated USING (review_status = 'VERIFIED');

-- 2. Crop Cycles (Farmer Ownership)
DROP POLICY IF EXISTS "Farmers can view their own crop cycles" ON crop_cycles;
CREATE POLICY "Farmers can view their own crop cycles" 
    ON crop_cycles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert their own crop cycles" ON crop_cycles;
CREATE POLICY "Farmers can insert their own crop cycles" 
    ON crop_cycles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update their own crop cycles" ON crop_cycles;
CREATE POLICY "Farmers can update their own crop cycles" 
    ON crop_cycles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete planned draft crop cycles only" ON crop_cycles;
CREATE POLICY "Farmers can delete planned draft crop cycles only" 
    ON crop_cycles FOR DELETE TO authenticated USING (auth.uid() = user_id AND status = 'PLANNED');

-- 3. Crop Cycle Stages
DROP POLICY IF EXISTS "Farmers can view stages of their own cycles" ON crop_cycle_stages;
CREATE POLICY "Farmers can view stages of their own cycles" 
    ON crop_cycle_stages FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM crop_cycles WHERE id = crop_cycle_stages.crop_cycle_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Farmers can update stage progress on their own cycles" ON crop_cycle_stages;
CREATE POLICY "Farmers can update stage progress on their own cycles" 
    ON crop_cycle_stages FOR UPDATE TO authenticated 
    USING (EXISTS (SELECT 1 FROM crop_cycles WHERE id = crop_cycle_stages.crop_cycle_id AND user_id = auth.uid()));

-- 4. Farm Tasks
DROP POLICY IF EXISTS "Farmers can view their own tasks" ON farm_tasks;
CREATE POLICY "Farmers can view their own tasks" 
    ON farm_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update their own task status and overrides" ON farm_tasks;
CREATE POLICY "Farmers can update their own task status and overrides" 
    ON farm_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Task Dependencies
DROP POLICY IF EXISTS "Farmers can view dependencies of their own tasks" ON task_dependencies;
CREATE POLICY "Farmers can view dependencies of their own tasks" 
    ON task_dependencies FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM farm_tasks WHERE id = task_dependencies.task_id AND user_id = auth.uid()));

-- 6. Task Schedule History (Immutable Audit - SELECT Only)
DROP POLICY IF EXISTS "Farmers can view schedule history of their own tasks" ON task_schedule_history;
CREATE POLICY "Farmers can view schedule history of their own tasks" 
    ON task_schedule_history FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM farm_tasks WHERE id = task_schedule_history.task_id AND user_id = auth.uid()));

-- 7. Field Activity Logs (Append-Only Observations)
DROP POLICY IF EXISTS "Farmers can view their own field activity logs" ON field_activity_logs;
CREATE POLICY "Farmers can view their own field activity logs" 
    ON field_activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can log their own field activities" ON field_activity_logs;
CREATE POLICY "Farmers can log their own field activities" 
    ON field_activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 8. Weather Snapshots (Read-Only Cache for Farm Owner)
DROP POLICY IF EXISTS "Farmers can view weather snapshots for their farms" ON weather_snapshots;
CREATE POLICY "Farmers can view weather snapshots for their farms" 
    ON weather_snapshots FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM farms WHERE id = weather_snapshots.farm_id AND user_id = auth.uid()));

-- 9. Decision Logs (Immutable Explainability Audit)
DROP POLICY IF EXISTS "Farmers can view decision logs for their cycles" ON decision_logs;
CREATE POLICY "Farmers can view decision logs for their cycles" 
    ON decision_logs FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM crop_cycles WHERE id = decision_logs.crop_cycle_id AND user_id = auth.uid()));

-- 10. Notification Queue
DROP POLICY IF EXISTS "Farmers can view their own notifications" ON notification_queue;
CREATE POLICY "Farmers can view their own notifications" 
    ON notification_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update status of their own notifications" ON notification_queue;
CREATE POLICY "Farmers can update status of their own notifications" 
    ON notification_queue FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMIT;
