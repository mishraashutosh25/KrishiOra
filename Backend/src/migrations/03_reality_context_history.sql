-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 03: Reality, Context & Immutable History Tables
-- ============================================================================
-- Safety: Non-destructive.
-- Enforces:
--   1. Weather snapshots cache per farm
--   2. Task schedule history strictly immutable (rejects UPDATE & DELETE)
--   3. Field activity logs separated from planned tasks (composite FK for user_id)
-- ============================================================================

-- 10. Weather Snapshots (Normalized External Forecast Cache)
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

-- 11. Immutable Task Schedule History
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

-- Immutability Protection for task_schedule_history
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

-- 12. Field Activity Logs (Ground Observations & Actual Progress)
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
    -- Composite FK: Guarantees activity log user_id strictly matches crop_cycle user_id
    CONSTRAINT fk_field_activity_cycle_user FOREIGN KEY (crop_cycle_id, user_id)
        REFERENCES crop_cycles (id, user_id) ON DELETE RESTRICT
);
