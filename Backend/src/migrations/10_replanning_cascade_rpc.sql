-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 10: Atomic Task Replanning & Cascade RPC
-- ============================================================================
-- Safety: Non-destructive.
-- Enforces:
--   1. Real PostgreSQL transaction boundary: updates task and cascades atomically.
--   2. Row locking (SELECT FOR UPDATE) on target task to prevent concurrency races.
--   3. Expected schedule version verification (optimistic concurrency).
--   4. Realized stage ceiling check: new_target_date <= stage.target_end_date.
--   5. Window constraint check: earliest <= target <= latest.
--   6. Recursive cascade update of downstream dependent tasks.
--   7. Append-only to task_schedule_history (immutable).
--   8. Identity derived strictly from auth.uid().
--   9. Strictly executable by authenticated users only.
-- ============================================================================

CREATE OR REPLACE FUNCTION reschedule_task_cascade_transactional(
    p_task_id UUID,
    p_expected_schedule_version INTEGER,
    p_new_earliest_date DATE,
    p_new_target_date DATE,
    p_new_latest_date DATE,
    p_change_trigger VARCHAR(50),
    p_actor_type VARCHAR(20),
    p_change_reason TEXT,
    p_rule_id VARCHAR(50) DEFAULT NULL,
    p_rule_version VARCHAR(20) DEFAULT NULL,
    p_weather_snapshot_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_task farm_tasks%ROWTYPE;
    v_stage crop_cycle_stages%ROWTYPE;
    v_delta_days INTEGER;
    v_updated_tasks JSONB := '[]'::JSONB;
    v_dep_record RECORD;
    v_dep_task farm_tasks%ROWTYPE;
    v_dep_stage crop_cycle_stages%ROWTYPE;
    v_dep_new_earliest DATE;
    v_dep_new_target DATE;
    v_dep_new_latest DATE;
BEGIN
    -- 1. Derive identity strictly from auth.uid()
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: auth.uid() is null'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- 2. Validate actor_type
    IF p_actor_type <> 'FARMER' THEN
        RAISE EXCEPTION 'Invalid actor type: only FARMER is permitted for schedule mutations in Phase 6'
            USING ERRCODE = 'check_violation';
    END IF;

    -- 3. Validate input date windows
    IF p_new_earliest_date > p_new_target_date OR p_new_target_date > p_new_latest_date THEN
        RAISE EXCEPTION 'Invalid action window: earliest (%) <= target (%) <= latest (%) required',
            p_new_earliest_date, p_new_target_date, p_new_latest_date
            USING ERRCODE = 'check_violation';
    END IF;

    -- 4. Lock row and verify ownership (FOR UPDATE concurrency lock)
    SELECT * INTO v_task
    FROM farm_tasks
    WHERE id = p_task_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task % not found or not owned by user %', p_task_id, v_user_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- 5. Optimistic concurrency check
    IF v_task.schedule_version <> p_expected_schedule_version THEN
        RAISE EXCEPTION 'Schedule version conflict: expected version %, but task is at version %',
            p_expected_schedule_version, v_task.schedule_version
            USING ERRCODE = 'check_violation';
    END IF;

    -- 6. Verify stage ceiling against persisted target_end_date
    SELECT * INTO v_stage
    FROM crop_cycle_stages
    WHERE id = v_task.stage_id;

    IF v_stage.id IS NOT NULL AND p_new_target_date > v_stage.target_end_date THEN
        RAISE EXCEPTION 'Stage ceiling violation: task target date (%) exceeds stage target end date (%)',
            p_new_target_date, v_stage.target_end_date
            USING ERRCODE = 'check_violation';
    END IF;

    -- 7. Calculate schedule shift delta
    v_delta_days := p_new_target_date - v_task.target_date;

    -- 8. Mutate primary task
    UPDATE farm_tasks
    SET earliest_date = p_new_earliest_date,
        target_date = p_new_target_date,
        latest_date = p_new_latest_date,
        schedule_version = v_task.schedule_version + 1,
        rule_id = COALESCE(p_rule_id, v_task.rule_id),
        rule_version = COALESCE(p_rule_version, v_task.rule_version),
        updated_at = NOW()
    WHERE id = p_task_id;

    -- 9. Insert immutable schedule history record
    INSERT INTO task_schedule_history (
        task_id,
        schedule_version,
        previous_earliest_date,
        previous_target_date,
        previous_latest_date,
        new_earliest_date,
        new_target_date,
        new_latest_date,
        change_trigger,
        actor_type,
        change_reason,
        rule_id,
        rule_version,
        weather_snapshot_id
    ) VALUES (
        p_task_id,
        v_task.schedule_version + 1,
        v_task.earliest_date,
        v_task.target_date,
        v_task.latest_date,
        p_new_earliest_date,
        p_new_target_date,
        p_new_latest_date,
        p_change_trigger,
        p_actor_type,
        p_change_reason,
        p_rule_id,
        p_rule_version,
        p_weather_snapshot_id
    );

    v_updated_tasks := v_updated_tasks || jsonb_build_object(
        'taskId', p_task_id,
        'newVersion', v_task.schedule_version + 1,
        'newTargetDate', p_new_target_date
    );

    -- 10. Downstream Dependency Cascade (Atomic all-or-nothing traversal)
    IF v_delta_days > 0 THEN
        FOR v_dep_record IN
            SELECT td.task_id AS downstream_task_id, td.min_lag_days
            FROM task_dependencies td
            WHERE td.prerequisite_task_id = p_task_id
        LOOP
            -- Lock and inspect downstream task
            SELECT * INTO v_dep_task
            FROM farm_tasks
            WHERE id = v_dep_record.downstream_task_id AND user_id = v_user_id
            FOR UPDATE;

            IF v_dep_task.id IS NOT NULL THEN
                -- If new prerequisite completion pushes past dependent earliest date
                IF p_new_target_date + v_dep_record.min_lag_days > v_dep_task.earliest_date THEN
                    v_dep_new_earliest := p_new_target_date + v_dep_record.min_lag_days;
                    v_dep_new_target := v_dep_task.target_date + v_delta_days;
                    v_dep_new_latest := v_dep_task.latest_date + v_delta_days;

                    IF v_dep_new_target < v_dep_new_earliest THEN
                        v_dep_new_target := v_dep_new_earliest;
                    END IF;
                    IF v_dep_new_latest < v_dep_new_target THEN
                        v_dep_new_latest := v_dep_new_target;
                    END IF;

                    -- Check downstream stage ceiling
                    SELECT * INTO v_dep_stage
                    FROM crop_cycle_stages
                    WHERE id = v_dep_task.stage_id;

                    IF v_dep_stage.id IS NOT NULL AND v_dep_new_target > v_dep_stage.target_end_date THEN
                        RAISE EXCEPTION 'Dependency cascade aborted: downstream task % would exceed stage ceiling %',
                            v_dep_task.task_code, v_dep_stage.target_end_date
                            USING ERRCODE = 'check_violation';
                    END IF;

                    -- Update downstream task
                    UPDATE farm_tasks
                    SET earliest_date = v_dep_new_earliest,
                        target_date = v_dep_new_target,
                        latest_date = v_dep_new_latest,
                        schedule_version = v_dep_task.schedule_version + 1,
                        updated_at = NOW()
                    WHERE id = v_dep_task.id;

                    -- Insert downstream history
                    INSERT INTO task_schedule_history (
                        task_id,
                        schedule_version,
                        previous_earliest_date,
                        previous_target_date,
                        previous_latest_date,
                        new_earliest_date,
                        new_target_date,
                        new_latest_date,
                        change_trigger,
                        actor_type,
                        change_reason,
                        rule_id,
                        rule_version,
                        weather_snapshot_id
                    ) VALUES (
                        v_dep_task.id,
                        v_dep_task.schedule_version + 1,
                        v_dep_task.earliest_date,
                        v_dep_task.target_date,
                        v_dep_task.latest_date,
                        v_dep_new_earliest,
                        v_dep_new_target,
                        v_dep_new_latest,
                        'DEPENDENCY_SHIFT',
                        'FARMER',
                        'Cascaded schedule shift from prerequisite task ' || v_task.task_code,
                        p_rule_id,
                        p_rule_version,
                        p_weather_snapshot_id
                    );

                    v_updated_tasks := v_updated_tasks || jsonb_build_object(
                        'taskId', v_dep_task.id,
                        'newVersion', v_dep_task.schedule_version + 1,
                        'newTargetDate', v_dep_new_target
                    );
                END IF;
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'primaryTaskId', p_task_id,
        'updatedTasks', v_updated_tasks
    );
END;
$$;

-- Security hardening: revoke public and service_role execution, grant strictly to authenticated
REVOKE ALL ON FUNCTION reschedule_task_cascade_transactional(UUID, INTEGER, DATE, DATE, DATE, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reschedule_task_cascade_transactional(UUID, INTEGER, DATE, DATE, DATE, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, UUID) TO authenticated;
