-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 12: Notification Engine Enhancements & Immutability Trigger
-- ============================================================================
-- 1. Add operational lifecycle timestamps and actionable metadata to notification_queue
-- 2. Add performance indexes for unread queries and task supersession sweeps
-- 3. Add PostgreSQL trigger enforcing strict immutability of identity/event fields
--    and restricting farmer-facing updates strictly to read_at.
-- ============================================================================

-- 1. Add operational lifecycle timestamps and actionable metadata
ALTER TABLE notification_queue 
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS actioned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS superseded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Partial index for rapid unread badge queries
CREATE INDEX IF NOT EXISTS idx_notification_user_unread 
    ON notification_queue (user_id, status) 
    WHERE read_at IS NULL;

-- 3. Index for task supersession sweeps
CREATE INDEX IF NOT EXISTS idx_notification_task_lookup
    ON notification_queue (task_id, status);

-- 4. Database Trigger: Enforce Identity Immutability & Protect Delivery Fields
CREATE OR REPLACE FUNCTION trg_protect_notification_queue_immutability()
RETURNS TRIGGER AS $$
BEGIN
    -- Reject changes to core identity/event fields
    IF NEW.id <> OLD.id OR
       NEW.user_id <> OLD.user_id OR
       NEW.crop_cycle_id <> OLD.crop_cycle_id OR
       NEW.task_id IS DISTINCT FROM OLD.task_id OR
       NEW.type <> OLD.type OR
       NEW.idempotency_key <> OLD.idempotency_key OR
       NEW.title <> OLD.title OR
       NEW.message <> OLD.message OR
       NEW.created_at <> OLD.created_at THEN
        RAISE EXCEPTION 'Immutability violation: Core notification identity/event fields cannot be modified.'
            USING ERRCODE = 'restrict_violation';
    END IF;

    -- If executed by an authenticated farmer session (not internal worker/system),
    -- ensure ONLY read_at can be modified
    IF current_setting('role', true) = 'authenticated' THEN
        IF NEW.actioned_at IS DISTINCT FROM OLD.actioned_at OR
           NEW.superseded_at IS DISTINCT FROM OLD.superseded_at OR
           NEW.sent_at IS DISTINCT FROM OLD.sent_at OR
           NEW.status <> OLD.status OR
           NEW.retry_count <> OLD.retry_count OR
           NEW.claim_expires_at IS DISTINCT FROM OLD.claim_expires_at OR
           NEW.error_message IS DISTINCT FROM OLD.error_message THEN
            RAISE EXCEPTION 'Security violation: Farmers can only update read status on notifications.'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_notification_immutability ON notification_queue;
CREATE TRIGGER trg_enforce_notification_immutability
    BEFORE UPDATE ON notification_queue
    FOR EACH ROW
    EXECUTE FUNCTION trg_protect_notification_queue_immutability();
