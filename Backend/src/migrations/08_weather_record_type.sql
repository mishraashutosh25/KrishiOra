-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 08: Weather Snapshots Record Type & Disambiguation
-- ============================================================================
-- Safety: Non-destructive.
-- Enforces:
--   1. Explicit distinction between FORECAST and HISTORICAL weather records.
--   2. Preserves both record types on the same date (e.g. today's forecast vs today's actual observation).
--   3. Updates unique constraint to (farm_id, forecast_date, data_source, record_type).
-- ============================================================================

-- 1. Add record_type column if not exists
ALTER TABLE weather_snapshots 
    ADD COLUMN IF NOT EXISTS record_type VARCHAR(20) NOT NULL DEFAULT 'FORECAST' 
    CHECK (record_type IN ('FORECAST', 'HISTORICAL'));

-- 2. Drop old constraint if exists
ALTER TABLE weather_snapshots 
    DROP CONSTRAINT IF EXISTS uq_farm_forecast_date;

-- 3. Add updated 4-tuple unique constraint
ALTER TABLE weather_snapshots 
    ADD CONSTRAINT uq_farm_forecast_date_type 
    UNIQUE (farm_id, forecast_date, data_source, record_type);

-- 4. Update index to cover record_type
DROP INDEX IF EXISTS idx_weather_snapshots_farm_date;
CREATE INDEX IF NOT EXISTS idx_weather_snapshots_farm_date_type 
    ON weather_snapshots (farm_id, forecast_date DESC, record_type);
