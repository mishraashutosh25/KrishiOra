-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 01: Master Agricultural Knowledge Catalogs (Reference Plane)
-- ============================================================================
-- Safety: Non-destructive. Creates reference catalogs for crops, varieties,
-- stage templates, activity templates, and authoritative agricultural rules.
-- Does NOT touch or alter existing farms, crops, expenses, or profiles tables.
-- ============================================================================

-- 1. Master Crop Knowledge Catalog
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

-- 2. Master Crop Variety Catalog
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

-- 3. Master Crop Stage Templates
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

-- 4. Master Crop Activity Templates
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

-- 5. Authoritative Agricultural Rules Catalog
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
