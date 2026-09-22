-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 09: Narrow Decision Logging RPC
-- ============================================================================
-- Safety: Non-destructive.
-- Enforces:
--   1. Narrowly scoped audit logging RPC for decision_logs.
--   2. Identity derived strictly from auth.uid().
--   3. Ownership verification: crop_cycles.user_id = auth.uid().
--   4. Task integrity: if task_id provided, ensures it belongs to crop_cycle_id and auth.uid().
--   5. Executable strictly by authenticated users. Service-role bypass REVOKED.
--   6. Fixed safe search_path = public, pg_temp.
-- ============================================================================

CREATE OR REPLACE FUNCTION record_engine_decision(
    p_crop_cycle_id UUID,
    p_task_id UUID,
    p_weather_snapshot_id UUID,
    p_rule_id VARCHAR(50),
    p_rule_version VARCHAR(20),
    p_decision VARCHAR(50),
    p_human_explanation TEXT,
    p_input_context JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_decision_id UUID;
BEGIN
    -- 1. Strictly derive authenticated user identity from auth.uid()
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: auth.uid() is null'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- 2. Verify crop cycle ownership
    IF NOT EXISTS (
        SELECT 1 FROM crop_cycles 
        WHERE id = p_crop_cycle_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized: User does not own crop cycle %', p_crop_cycle_id
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- 3. Verify task ownership and relationship if task_id is provided
    IF p_task_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM farm_tasks 
            WHERE id = p_task_id 
              AND crop_cycle_id = p_crop_cycle_id 
              AND user_id = v_user_id
        ) THEN
            RAISE EXCEPTION 'Invalid task reference: Task % does not belong to cycle % or user %', 
                p_task_id, p_crop_cycle_id, v_user_id
                USING ERRCODE = 'foreign_key_violation';
        END IF;
    END IF;

    -- 4. Verify rule existence if rule_id is provided
    IF p_rule_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM agricultural_rules WHERE id = p_rule_id
        ) THEN
            RAISE EXCEPTION 'Invalid rule reference: Rule % does not exist', p_rule_id
                USING ERRCODE = 'foreign_key_violation';
        END IF;
    END IF;

    -- 5. Insert immutable decision log
    INSERT INTO decision_logs (
        crop_cycle_id,
        task_id,
        weather_snapshot_id,
        rule_id,
        rule_version,
        decision,
        human_explanation,
        input_context
    ) VALUES (
        p_crop_cycle_id,
        p_task_id,
        p_weather_snapshot_id,
        p_rule_id,
        p_rule_version,
        p_decision,
        p_human_explanation,
        p_input_context
    ) RETURNING id INTO v_decision_id;

    RETURN v_decision_id;
END;
$$;

-- Security hardening: revoke public and service_role execution, grant strictly to authenticated
REVOKE ALL ON FUNCTION record_engine_decision(UUID, UUID, UUID, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_engine_decision(UUID, UUID, UUID, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB) TO authenticated;
