-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 05: Targeted High-Performance Indexes
-- ============================================================================
-- Safety: Non-destructive.
-- Adds ONLY targeted indexes corresponding to actual query/worker patterns.
-- Avoids speculative or duplicate indexes.
-- ============================================================================

-- 1. Active Crop Cycles Lookup by User
CREATE INDEX IF NOT EXISTS idx_crop_cycles_user_status 
    ON crop_cycles (user_id, status);

-- 2. Stage Order Sequence Lookup for Timeline
CREATE INDEX IF NOT EXISTS idx_cycle_stages_order 
    ON crop_cycle_stages (crop_cycle_id, stage_order);

-- 3. Today's Farm Plan & Date Range Queries for a Specific Cycle
CREATE INDEX IF NOT EXISTS idx_farm_tasks_cycle_target_status 
    ON farm_tasks (crop_cycle_id, target_date, status);

-- 4. Global Actionable Tasks Query Across All Farmer's Farms
CREATE INDEX IF NOT EXISTS idx_farm_tasks_user_status_target 
    ON farm_tasks (user_id, status, target_date);

-- 5. Weather Evaluation Query: Weather-sensitive eligible future tasks
CREATE INDEX IF NOT EXISTS idx_farm_tasks_weather_eval 
    ON farm_tasks (crop_cycle_id, status) 
    WHERE is_weather_sensitive = true AND status IN ('SCHEDULED', 'PENDING_ACTION');

-- 6. Schedule History Query: Retrieve versions for "Why did this task move?"
CREATE INDEX IF NOT EXISTS idx_schedule_history_task_version 
    ON task_schedule_history (task_id, schedule_version DESC);

-- 7. Field Activity Log Query: Chronological ground activity timeline
CREATE INDEX IF NOT EXISTS idx_field_activity_cycle_date 
    ON field_activity_logs (crop_cycle_id, action_date DESC);

-- 8. Weather Cache Query: Get freshest forecast for a farm
CREATE INDEX IF NOT EXISTS idx_weather_snapshots_farm_date 
    ON weather_snapshots (farm_id, forecast_date DESC);

-- 9. Decision Audit Log Query: Chronological explainability trail
CREATE INDEX IF NOT EXISTS idx_decision_logs_cycle_time 
    ON decision_logs (crop_cycle_id, evaluation_timestamp DESC);

-- 10. Notification Worker Queue Query: Fetch pending alerts by priority & schedule
CREATE INDEX IF NOT EXISTS idx_notification_queue_worker 
    ON notification_queue (status, priority, scheduled_for) 
    WHERE status = 'PENDING';

-- 11. Notification Delivery Attempt Audit Query
CREATE INDEX IF NOT EXISTS idx_notification_attempts_lookup 
    ON notification_attempts (notification_id, attempt_number);
