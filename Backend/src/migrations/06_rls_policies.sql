-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 06: Restrictive Granular Row Level Security (RLS) Policies
-- ============================================================================
-- Security Model:
--   1. Zero blanket "FOR ALL" policies on sensitive tables.
--   2. Explicit SELECT, INSERT, UPDATE, DELETE rules.
--   3. Master agricultural knowledge is strictly Read-Only for farmers.
--   4. Immutable tables (task_schedule_history, decision_logs, notification_attempts)
--      have NO user-level INSERT, UPDATE, or DELETE policies.
-- ============================================================================

-- Enable RLS on all tables
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

-- ============================================================================
-- 1. Master Knowledge Catalogs (Read-Only to Authenticated Farmers)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can read active crop catalog" ON crop_knowledge_catalog;
CREATE POLICY "Authenticated users can read active crop catalog" 
    ON crop_knowledge_catalog FOR SELECT 
    TO authenticated 
    USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can read active variety catalog" ON crop_variety_catalog;
CREATE POLICY "Authenticated users can read active variety catalog" 
    ON crop_variety_catalog FOR SELECT 
    TO authenticated 
    USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can read stage templates" ON crop_stage_templates;
CREATE POLICY "Authenticated users can read stage templates" 
    ON crop_stage_templates FOR SELECT 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can read activity templates" ON crop_activity_templates;
CREATE POLICY "Authenticated users can read activity templates" 
    ON crop_activity_templates FOR SELECT 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can read agricultural rules" ON agricultural_rules;
CREATE POLICY "Authenticated users can read agricultural rules" 
    ON agricultural_rules FOR SELECT 
    TO authenticated 
    USING (review_status = 'VERIFIED');

-- Note: No INSERT, UPDATE, or DELETE policies exist for authenticated users on master catalogs.
-- Only service_role can modify agricultural knowledge.

-- ============================================================================
-- 2. Crop Cycles (Farmer Ownership)
-- ============================================================================
DROP POLICY IF EXISTS "Farmers can view their own crop cycles" ON crop_cycles;
CREATE POLICY "Farmers can view their own crop cycles" 
    ON crop_cycles FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert their own crop cycles" ON crop_cycles;
CREATE POLICY "Farmers can insert their own crop cycles" 
    ON crop_cycles FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update their own crop cycles" ON crop_cycles;
CREATE POLICY "Farmers can update their own crop cycles" 
    ON crop_cycles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete planned draft crop cycles only" ON crop_cycles;
CREATE POLICY "Farmers can delete planned draft crop cycles only" 
    ON crop_cycles FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id AND status = 'PLANNED');

-- ============================================================================
-- 3. Crop Cycle Stages (Scoped to Cycle Owner)
-- ============================================================================
DROP POLICY IF EXISTS "Farmers can view stages of their own cycles" ON crop_cycle_stages;
CREATE POLICY "Farmers can view stages of their own cycles" 
    ON crop_cycle_stages FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM crop_cycles 
            WHERE crop_cycles.id = crop_cycle_stages.crop_cycle_id 
              AND crop_cycles.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Farmers can update stage progress on their own cycles" ON crop_cycle_stages;
CREATE POLICY "Farmers can update stage progress on their own cycles" 
    ON crop_cycle_stages FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM crop_cycles 
            WHERE crop_cycles.id = crop_cycle_stages.crop_cycle_id 
              AND crop_cycles.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 4. Farm Tasks (Scoped to Farmer)
-- ============================================================================
DROP POLICY IF EXISTS "Farmers can view their own tasks" ON farm_tasks;
CREATE POLICY "Farmers can view their own tasks" 
    ON farm_tasks FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update their own task status and overrides" ON farm_tasks;
CREATE POLICY "Farmers can update their own task status and overrides" 
    ON farm_tasks FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Note: Normal users cannot directly INSERT or DELETE farm tasks. 
-- Task generation is handled by backend service_role during cycle planning.

-- ============================================================================
-- 5. Task Dependencies (Scoped to Farmer's Tasks)
-- ============================================================================
DROP POLICY IF EXISTS "Farmers can view dependencies of their own tasks" ON task_dependencies;
CREATE POLICY "Farmers can view dependencies of their own tasks" 
    ON task_dependencies FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM farm_tasks 
            WHERE farm_tasks.id = task_dependencies.task_id 
              AND farm_tasks.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 6. Task Schedule History (Immutable Audit - SELECT Only)
-- ============================================================================
DROP POLICY IF EXISTS "Farmers can view schedule history of their own tasks" ON task_schedule_history;
CREATE POLICY "Farmers can view schedule history of their own tasks" 
    ON task_schedule_history FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM farm_tasks 
            WHERE farm_tasks.id = task_schedule_history.task_id 
              AND farm_tasks.user_id = auth.uid()
        )
    );
-- Strictly NO INSERT, UPDATE, or DELETE policies for authenticated users.

-- ============================================================================
-- 7. Field Activity Logs (Append-Only Ground Observations)
-- ============================================================================
DROP POLICY IF EXISTS "Farmers can view their own field activity logs" ON field_activity_logs;
CREATE POLICY "Farmers can view their own field activity logs" 
    ON field_activity_logs FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can log their own field activities" ON field_activity_logs;
CREATE POLICY "Farmers can log their own field activities" 
    ON field_activity_logs FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);
-- Strictly NO UPDATE or DELETE policies for authenticated users. Past activities cannot be modified.

-- ============================================================================
-- 8. Weather Snapshots (Read-Only Cache for Farm Owner)
-- ============================================================================
DROP POLICY IF EXISTS "Farmers can view weather snapshots for their farms" ON weather_snapshots;
CREATE POLICY "Farmers can view weather snapshots for their farms" 
    ON weather_snapshots FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = weather_snapshots.farm_id 
              AND farms.user_id = auth.uid()
        )
    );
-- Strictly NO user-level INSERT, UPDATE, or DELETE. Weather worker manages snapshots.

-- ============================================================================
-- 9. Decision Logs (Immutable Explainability Audit)
-- ============================================================================
DROP POLICY IF EXISTS "Farmers can view decision logs for their cycles" ON decision_logs;
CREATE POLICY "Farmers can view decision logs for their cycles" 
    ON decision_logs FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM crop_cycles 
            WHERE crop_cycles.id = decision_logs.crop_cycle_id 
              AND crop_cycles.user_id = auth.uid()
        )
    );
-- Strictly NO user-level INSERT, UPDATE, or DELETE. Engine logs decisions via service_role.

-- ============================================================================
-- 10. Notification Queue (Farmer Notifications)
-- ============================================================================
DROP POLICY IF EXISTS "Farmers can view their own notifications" ON notification_queue;
CREATE POLICY "Farmers can view their own notifications" 
    ON notification_queue FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update status of their own notifications" ON notification_queue;
CREATE POLICY "Farmers can update status of their own notifications" 
    ON notification_queue FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
-- Note: notification_attempts has zero policies for authenticated users (internal worker only).
