-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 02: Operational Planning Tables & Constraints
-- ============================================================================
-- Safety: Non-destructive.
-- Enforces:
--   1. Composite FK on farm_tasks (crop_cycle_id, user_id) -> crop_cycles (id, user_id)
--   2. Composite FK on farm_tasks (stage_id, crop_cycle_id) -> crop_cycle_stages (id, crop_cycle_id)
--   3. Date safety via PostgreSQL DATE types (no UTC drift)
--   4. Task dependency cycle prevention via recursive CTE trigger function
-- ============================================================================

-- 6. Crop Cycles (Active Season Aggregate)
CREATE TABLE IF NOT EXISTS crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE RESTRICT,
    legacy_crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    
    -- Immutable Snapshot Data (Preserves historical reality)
    crop_code VARCHAR(50) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    variety_code VARCHAR(50),
    variety_name VARCHAR(100),
    allocated_area NUMERIC(10, 2) NOT NULL CHECK (allocated_area > 0),
    area_unit VARCHAR(20) NOT NULL DEFAULT 'acre',
    soil_type VARCHAR(50),
    irrigation_type VARCHAR(50),
    
    -- Planning Milestones (PostgreSQL DATE prevents UTC day shift bugs)
    sowing_date DATE NOT NULL,
    target_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    cycle_completion_date DATE,
    
    -- State Machine
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('PLANNED', 'ACTIVE', 'HARVEST_READY', 'HARVESTED', 'POST_HARVEST', 'COMPLETED', 'ABANDONED')),
    knowledge_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_harvest_after_sowing CHECK (target_harvest_date >= sowing_date),
    CONSTRAINT uq_crop_cycles_id_user UNIQUE (id, user_id)
);

-- 7. Realized Crop Cycle Stages
CREATE TABLE IF NOT EXISTS crop_cycle_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
    stage_code VARCHAR(50) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    
    -- Realized Action Windows for Stage
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

-- 8. Planned Farm Tasks (Action Windows Model)
CREATE TABLE IF NOT EXISTS farm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID NOT NULL,
    stage_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    task_code VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('SOWING', 'IRRIGATION', 'NUTRIENT', 'PROTECTION', 'INSPECTION', 'HARVEST', 'POST_HARVEST')),
    description TEXT,
    
    -- Dynamic Action Windows
    earliest_date DATE NOT NULL,
    target_date DATE NOT NULL,
    latest_date DATE NOT NULL,
    
    -- Status & Priority
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED' 
        CHECK (status IN ('SCHEDULED', 'PENDING_ACTION', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'SKIPPED', 'UNABLE_TO_COMPLETE', 'CANCELLED')),
    
    -- Weather Sensitivity Flags
    is_weather_sensitive BOOLEAN NOT NULL DEFAULT false,
    weather_sensitivity_type VARCHAR(50) CHECK (weather_sensitivity_type IN ('RAIN_AVOIDANCE', 'HIGH_WIND_AVOIDANCE', 'SOIL_MOISTURE_CHECK', 'SUNNY_WINDOW_REQUIRED')),
    
    -- Versioning & Audit
    schedule_version INTEGER NOT NULL DEFAULT 1,
    rule_id VARCHAR(50) REFERENCES agricultural_rules(id) ON DELETE SET NULL,
    rule_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_task_window CHECK (earliest_date <= target_date AND target_date <= latest_date),
    -- Composite FK 1: Native guarantee that task user_id matches cycle user_id
    CONSTRAINT fk_farm_tasks_cycle_user FOREIGN KEY (crop_cycle_id, user_id) 
        REFERENCES crop_cycles (id, user_id) ON DELETE CASCADE,
    -- Composite FK 2: Native guarantee that task stage belongs to the same crop_cycle
    CONSTRAINT fk_farm_tasks_stage_cycle FOREIGN KEY (stage_id, crop_cycle_id) 
        REFERENCES crop_cycle_stages (id, crop_cycle_id) ON DELETE CASCADE
);

-- 9. Task Dependencies
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

-- Dependency Cycle Prevention Trigger (Database Safety Net)
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
