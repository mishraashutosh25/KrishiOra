-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 11: Dedicated Field Activity Execution & Stage Progression RPC
-- ============================================================================
-- Security & Operational Guarantees:
--   1. Identity derived strictly from auth.uid() (fails if auth.uid() IS NULL)
--   2. Complete ownership chain: auth.uid() -> crop_cycles.user_id -> farm_tasks.user_id
--   3. Cross-cycle task alignment: farm_tasks.crop_cycle_id == p_crop_cycle_id
--   4. User-scoped partial unique index on (user_id, metadata->>'idempotency_key')
--   5. Idempotency payload binding: same key + same payload = replay; same key + different payload = conflict
--   6. Pessimistic row locking on target task (SELECT ... FOR UPDATE)
--   7. Deterministic task status transition matrix
--   8. Deterministic stage progression & actual_end_date calculation
--   9. Zero successful completion rule: stage cannot complete if 0 tasks completed
--  10. Mandatory task omission rule: critical task unfulfilled prevents stage completion
--  11. Strengthened HARVESTED cycle guard: pre-harvest complete + harvest task completed + prereqs completed
--  12. Granted strictly to authenticated; revoked from service_role, anon, and public
-- ============================================================================

-- 1. Partial Unique Index scoped to (user_id, idempotency_key)
CREATE UNIQUE INDEX IF NOT EXISTS uq_field_activity_user_idempotency
    ON field_activity_logs (user_id, (metadata->>'idempotency_key'))
    WHERE metadata->>'idempotency_key' IS NOT NULL;

-- 2. Dedicated Transactional RPC
CREATE OR REPLACE FUNCTION execute_farmer_field_activity(
    p_crop_cycle_id UUID,
    p_task_id UUID,
    p_action_taken VARCHAR(100),
    p_action_date DATE,
    p_status VARCHAR(30),
    p_reason_code VARCHAR(50) DEFAULT NULL,
    p_farmer_notes TEXT DEFAULT NULL,
    p_idempotency_key VARCHAR(100) DEFAULT NULL,
    p_payload_hash VARCHAR(64) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_cycle RECORD;
    v_task farm_tasks%ROWTYPE;
    v_stage crop_cycle_stages%ROWTYPE;
    v_activity_id UUID;
    v_existing_activity RECORD;
    v_stage_all_terminal BOOLEAN;
    v_completed_count INTEGER;
    v_mandatory_unfulfilled INTEGER;
    v_stage_advanced BOOLEAN := false;
    v_stage_new_status VARCHAR(20);
    v_stage_actual_end_date DATE;
    v_cycle_new_status VARCHAR(30);
    v_pre_harvest_incomplete INTEGER;
    v_harvest_prereqs_incomplete INTEGER;
    v_all_stages_completed BOOLEAN;
    v_variance_days INTEGER;
    v_timing VARCHAR(20);
    v_full_metadata JSONB;
BEGIN
    -- 1. Derive authenticated identity
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: execute_farmer_field_activity requires an authenticated session'
            USING ERRCODE = '42501';
    END IF;

    -- 2. Validate Crop Cycle Ownership
    SELECT id, user_id, farm_id, sowing_date, status, target_harvest_date
    INTO v_cycle
    FROM crop_cycles
    WHERE id = p_crop_cycle_id;

    IF v_cycle.id IS NULL THEN
        RAISE EXCEPTION 'Crop cycle not found: %', p_crop_cycle_id
            USING ERRCODE = 'P0002';
    END IF;

    IF v_cycle.user_id <> v_user_id THEN
        RAISE EXCEPTION 'Unauthorized: User does not own crop cycle %', p_crop_cycle_id
            USING ERRCODE = '42501';
    END IF;

    IF v_cycle.status IN ('COMPLETED', 'ABANDONED') THEN
        RAISE EXCEPTION 'Invalid cycle status: Activities cannot be logged for % cycle %', v_cycle.status, p_crop_cycle_id
            USING ERRCODE = 'P0001';
    END IF;

    -- 3. Validate Action Date Boundaries
    IF p_action_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Invalid action date: Action date (%) cannot be in the future (today is %)', p_action_date, CURRENT_DATE
            USING ERRCODE = '22007';
    END IF;

    IF p_action_date < v_cycle.sowing_date THEN
        RAISE EXCEPTION 'Invalid action date: Action date (%) cannot precede cycle sowing date (%)', p_action_date, v_cycle.sowing_date
            USING ERRCODE = '22007';
    END IF;

    -- 4. Validate Status and Reason Codes
    IF p_status NOT IN ('IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'SKIPPED', 'UNABLE_TO_COMPLETE') THEN
        RAISE EXCEPTION 'Invalid activity status: %', p_status
            USING ERRCODE = '22023';
    END IF;

    IF p_status IN ('POSTPONED', 'UNABLE_TO_COMPLETE') THEN
        IF p_reason_code IS NULL OR p_reason_code NOT IN (
            'RAIN_INTERFERENCE', 'SOIL_TOO_WET', 'LABOUR_UNAVAILABLE', 
            'WATER_SHORTAGE', 'EQUIPMENT_BREAKDOWN', 'OBSERVED_READY_EARLY', 'OTHER'
        ) THEN
            RAISE EXCEPTION 'Invalid or missing reason_code for %: %', p_status, p_reason_code
                USING ERRCODE = '22023';
        END IF;
    END IF;

    -- 5. User-Scoped Idempotency & Payload Binding Check
    IF p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN
        SELECT id, task_id, status, action_date, created_at, metadata
        INTO v_existing_activity
        FROM field_activity_logs
        WHERE user_id = v_user_id
          AND metadata->>'idempotency_key' = p_idempotency_key;

        IF v_existing_activity.id IS NOT NULL THEN
            -- Check payload hash binding
            IF p_payload_hash IS NOT NULL AND v_existing_activity.metadata->>'payload_hash' IS NOT NULL THEN
                IF v_existing_activity.metadata->>'payload_hash' <> p_payload_hash THEN
                    RAISE EXCEPTION 'Idempotency key conflict: Key % already used with different request payload', p_idempotency_key
                        USING ERRCODE = '23505';
                END IF;
            END IF;

            -- Return idempotent replay with zero state mutation
            RETURN jsonb_build_object(
                'success', true,
                'idempotent_replay', true,
                'activity_log_id', v_existing_activity.id,
                'crop_cycle_id', p_crop_cycle_id,
                'task_id', v_existing_activity.task_id,
                'task_status', v_existing_activity.status,
                'action_date', v_existing_activity.action_date,
                'recorded_at', v_existing_activity.created_at,
                'message', 'Idempotent replay: Activity was previously recorded.'
            );
        END IF;
    END IF;

    -- 6. Task-Specific Validations and Row Locking (if task_id provided)
    IF p_task_id IS NOT NULL THEN
        -- Pessimistic row locking on target task
        SELECT id, crop_cycle_id, stage_id, user_id, task_code, title, category,
               earliest_date, target_date, latest_date, priority, status
        INTO v_task
        FROM farm_tasks
        WHERE id = p_task_id
        FOR UPDATE;

        IF v_task.id IS NULL THEN
            RAISE EXCEPTION 'Task not found: %', p_task_id
                USING ERRCODE = 'P0002';
        END IF;

        IF v_task.user_id <> v_user_id THEN
            RAISE EXCEPTION 'Unauthorized: User does not own task %', p_task_id
                USING ERRCODE = '42501';
        END IF;

        IF v_task.crop_cycle_id <> p_crop_cycle_id THEN
            RAISE EXCEPTION 'Task cycle mismatch: Task % belongs to cycle %, not %', p_task_id, v_task.crop_cycle_id, p_crop_cycle_id
                USING ERRCODE = '23503';
        END IF;

        -- Task Status Transition Matrix Guards
        IF v_task.status = 'COMPLETED' THEN
            RAISE EXCEPTION 'TaskAlreadyCompletedError: Task % is already COMPLETED and cannot be re-executed', p_task_id
                USING ERRCODE = 'P0001';
        END IF;

        IF v_task.status IN ('SKIPPED', 'CANCELLED') THEN
            RAISE EXCEPTION 'TaskAlreadyResolvedError: Task % is already in terminal state % and cannot be re-executed', p_task_id, v_task.status
                USING ERRCODE = 'P0001';
        END IF;

        -- Calculate Variance Metrics
        v_variance_days := (p_action_date - v_task.target_date);
        IF p_action_date < v_task.earliest_date THEN
            v_timing := 'EARLY';
        ELSIF p_action_date <= v_task.latest_date THEN
            v_timing := 'ON_TIME';
        ELSE
            v_timing := 'DELAYED';
        END IF;
    ELSE
        v_variance_days := 0;
        v_timing := 'N_A';
    END IF;

    -- 7. Insert Immutable Field Activity Log
    v_full_metadata := COALESCE(p_metadata, '{}'::JSONB);
    IF p_idempotency_key IS NOT NULL THEN
        v_full_metadata := v_full_metadata || jsonb_build_object('idempotency_key', p_idempotency_key);
    END IF;
    IF p_payload_hash IS NOT NULL THEN
        v_full_metadata := v_full_metadata || jsonb_build_object('payload_hash', p_payload_hash);
    END IF;

    INSERT INTO field_activity_logs (
        crop_cycle_id,
        task_id,
        user_id,
        action_taken,
        action_date,
        status,
        reason_code,
        farmer_notes,
        metadata
    ) VALUES (
        p_crop_cycle_id,
        p_task_id,
        v_user_id,
        p_action_taken,
        p_action_date,
        p_status,
        p_reason_code,
        p_farmer_notes,
        v_full_metadata
    )
    RETURNING id INTO v_activity_id;

    -- 8. If Task Provided, Update Task Status and Process Progression State Machine
    IF p_task_id IS NOT NULL THEN
        -- Update farm_tasks status
        UPDATE farm_tasks
        SET status = p_status,
            updated_at = NOW()
        WHERE id = p_task_id;

        -- Fetch Stage details
        SELECT id, crop_cycle_id, stage_code, stage_name, stage_order, status,
               earliest_start_date, target_start_date, latest_start_date, target_end_date,
               actual_start_date, actual_end_date
        INTO v_stage
        FROM crop_cycle_stages
        WHERE id = v_task.stage_id;

        -- Stage Activation (UPCOMING -> IN_PROGRESS)
        IF v_stage.status = 'UPCOMING' AND p_status IN ('IN_PROGRESS', 'COMPLETED') THEN
            UPDATE crop_cycle_stages
            SET status = 'IN_PROGRESS',
                actual_start_date = LEAST(COALESCE(actual_start_date, p_action_date), p_action_date),
                updated_at = NOW()
            WHERE id = v_stage.id;
            v_stage_advanced := true;
            v_stage_new_status := 'IN_PROGRESS';
        ELSE
            v_stage_new_status := v_stage.status;
        END IF;

        -- Check if all tasks in this stage have reached terminal status
        SELECT NOT EXISTS (
            SELECT 1 FROM farm_tasks
            WHERE stage_id = v_stage.id
              AND status NOT IN ('COMPLETED', 'SKIPPED', 'UNABLE_TO_COMPLETE')
        ) INTO v_stage_all_terminal;

        IF v_stage_all_terminal THEN
            -- Count successful completions in stage
            SELECT COUNT(*) INTO v_completed_count
            FROM farm_tasks
            WHERE stage_id = v_stage.id AND status = 'COMPLETED';

            -- Check if zero successful completions
            IF v_completed_count = 0 THEN
                -- Stage CANNOT become COMPLETED; transitions to DELAYED
                UPDATE crop_cycle_stages
                SET status = 'DELAYED',
                    updated_at = NOW()
                WHERE id = v_stage.id;
                v_stage_new_status := 'DELAYED';
            ELSE
                -- Check for mandatory task omissions
                -- Mandatory = priority == 'CRITICAL' OR is a prerequisite in task_dependencies
                SELECT COUNT(*) INTO v_mandatory_unfulfilled
                FROM farm_tasks ft
                WHERE ft.stage_id = v_stage.id
                  AND ft.status IN ('SKIPPED', 'UNABLE_TO_COMPLETE')
                  AND (
                      ft.priority = 'CRITICAL'
                      OR EXISTS (
                          SELECT 1 FROM task_dependencies td
                          WHERE td.prerequisite_task_id = ft.id
                      )
                  );

                IF v_mandatory_unfulfilled > 0 THEN
                    -- Mandatory task was omitted; stage cannot complete normally
                    UPDATE crop_cycle_stages
                    SET status = 'DELAYED',
                        updated_at = NOW()
                    WHERE id = v_stage.id;
                    v_stage_new_status := 'DELAYED';
                ELSE
                    -- Stage completed successfully!
                    -- actual_end_date = latest COMPLETED task action date
                    SELECT MAX(fal.action_date) INTO v_stage_actual_end_date
                    FROM field_activity_logs fal
                    JOIN farm_tasks ft ON ft.id = fal.task_id
                    WHERE ft.stage_id = v_stage.id
                      AND fal.status = 'COMPLETED';

                    UPDATE crop_cycle_stages
                    SET status = 'COMPLETED',
                        actual_end_date = COALESCE(v_stage_actual_end_date, p_action_date),
                        updated_at = NOW()
                    WHERE id = v_stage.id;
                    v_stage_advanced := true;
                    v_stage_new_status := 'COMPLETED';

                    -- Auto-unlock subsequent stage if UPCOMING
                    UPDATE crop_cycle_stages
                    SET status = 'IN_PROGRESS',
                        actual_start_date = COALESCE(actual_start_date, p_action_date),
                        updated_at = NOW()
                    WHERE crop_cycle_id = p_crop_cycle_id
                      AND stage_order = v_stage.stage_order + 1
                      AND status = 'UPCOMING';
                END IF;
            END IF;
        END IF;

        -- Check Cycle Harvest Transition Guard
        v_cycle_new_status := v_cycle.status;
        IF p_status = 'COMPLETED' AND v_task.category = 'HARVEST' THEN
            -- Condition 1: All pre-harvest stages are COMPLETED
            SELECT COUNT(*) INTO v_pre_harvest_incomplete
            FROM crop_cycle_stages
            WHERE crop_cycle_id = p_crop_cycle_id
              AND stage_order < v_stage.stage_order
              AND status <> 'COMPLETED';

            -- Condition 3: All prerequisite tasks of this harvest task are COMPLETED
            SELECT COUNT(*) INTO v_harvest_prereqs_incomplete
            FROM task_dependencies td
            JOIN farm_tasks prereq ON prereq.id = td.prerequisite_task_id
            WHERE td.task_id = p_task_id
              AND prereq.status <> 'COMPLETED';

            IF v_pre_harvest_incomplete = 0 AND v_harvest_prereqs_incomplete = 0 THEN
                UPDATE crop_cycles
                SET status = 'HARVESTED',
                    actual_harvest_date = p_action_date,
                    updated_at = NOW()
                WHERE id = p_crop_cycle_id;
                v_cycle_new_status := 'HARVESTED';
            END IF;
        END IF;

        -- Check Cycle Final Completion Guard
        SELECT NOT EXISTS (
            SELECT 1 FROM crop_cycle_stages
            WHERE crop_cycle_id = p_crop_cycle_id
              AND status <> 'COMPLETED'
        ) INTO v_all_stages_completed;

        IF v_all_stages_completed THEN
            -- Verify any post-harvest tasks are terminal
            IF NOT EXISTS (
                SELECT 1 FROM farm_tasks
                WHERE crop_cycle_id = p_crop_cycle_id
                  AND category = 'POST_HARVEST'
                  AND status NOT IN ('COMPLETED', 'SKIPPED')
            ) THEN
                UPDATE crop_cycles
                SET status = 'COMPLETED',
                    cycle_completion_date = p_action_date,
                    updated_at = NOW()
                WHERE id = p_crop_cycle_id;
                v_cycle_new_status := 'COMPLETED';
            END IF;
        END IF;
    END IF;

    -- 9. Return structured execution result
    RETURN jsonb_build_object(
        'success', true,
        'idempotent_replay', false,
        'activity_log_id', v_activity_id,
        'crop_cycle_id', p_crop_cycle_id,
        'task_id', p_task_id,
        'task_status', p_status,
        'action_date', p_action_date,
        'recorded_at', NOW(),
        'variance', jsonb_build_object(
            'planned_target_date', CASE WHEN p_task_id IS NOT NULL THEN v_task.target_date ELSE NULL END,
            'variance_days', v_variance_days,
            'execution_timing', v_timing
        ),
        'stage_progress', jsonb_build_object(
            'stage_id', CASE WHEN p_task_id IS NOT NULL THEN v_stage.id ELSE NULL END,
            'stage_code', CASE WHEN p_task_id IS NOT NULL THEN v_stage.stage_code ELSE NULL END,
            'stage_status', v_stage_new_status,
            'stage_advanced', v_stage_advanced
        ),
        'cycle_status', v_cycle_new_status
    );
END;
$$;

-- Revoke from public, anon, and service_role; grant strictly to authenticated
REVOKE ALL ON FUNCTION execute_farmer_field_activity FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION execute_farmer_field_activity TO authenticated;
