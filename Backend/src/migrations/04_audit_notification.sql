-- ============================================================================
-- KrishiOra Smart Crop Lifecycle & Farm Action Planner
-- Migration 04: Explainable Decision Logs & Notification Queue
-- ============================================================================
-- Safety: Non-destructive.
-- Enforces:
--   1. Decision logs immutable (rejects UPDATE & DELETE)
--   2. Notification queue with strict unique idempotency_key
--   3. Notification delivery attempts audit trail
--   4. Composite FK linking notification_queue user_id to crop_cycles user_id
-- ============================================================================

-- 13. Decision Logs (Explainability Audit Trail)
CREATE TABLE IF NOT EXISTS decision_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE RESTRICT,
    task_id UUID REFERENCES farm_tasks(id) ON DELETE SET NULL,
    weather_snapshot_id UUID REFERENCES weather_snapshots(id) ON DELETE SET NULL,
    
    rule_id VARCHAR(50) REFERENCES agricultural_rules(id) ON DELETE RESTRICT,
    rule_version VARCHAR(20) NOT NULL,
    
    evaluation_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('NO_CHANGE', 'RESCHEDULE', 'INSPECTION_REQUIRED', 'WEATHER_AFFECTED', 'WEATHER_UNAVAILABLE', 'KNOWLEDGE_UNAVAILABLE')),
    human_explanation TEXT NOT NULL,
    input_context JSONB NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutability Protection for decision_logs
CREATE OR REPLACE FUNCTION trg_reject_decision_mutations()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Immutability violation: decision_logs records are permanent audit evidence and cannot be updated or deleted.'
        USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_decision_logs_update ON decision_logs;
CREATE TRIGGER trg_protect_decision_logs_update
    BEFORE UPDATE OR DELETE ON decision_logs
    FOR EACH ROW
    EXECUTE FUNCTION trg_reject_decision_mutations();

-- 14. Notification Queue (Deduplicated Alerts Engine)
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    crop_cycle_id UUID NOT NULL,
    task_id UUID REFERENCES farm_tasks(id) ON DELETE SET NULL,
    
    idempotency_key VARCHAR(200) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('TASK_REMINDER', 'WEATHER_ADVISORY', 'HARVEST_READINESS', 'RISK_ALERT')),
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('CRITICAL', 'HIGH', 'NORMAL', 'LOW')),
    
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    
    -- Composite FK: Guarantees notification user_id strictly matches cycle user_id
    CONSTRAINT fk_notification_cycle_user FOREIGN KEY (crop_cycle_id, user_id)
        REFERENCES crop_cycles (id, user_id) ON DELETE CASCADE
);

-- 15. Notification Delivery Attempt Logs
CREATE TABLE IF NOT EXISTS notification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notification_queue(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE')),
    response_payload JSONB,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutability Protection for notification_attempts
CREATE OR REPLACE FUNCTION trg_reject_attempt_mutations()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Immutability violation: notification_attempts records cannot be updated or deleted.'
        USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_notification_attempts ON notification_attempts;
CREATE TRIGGER trg_protect_notification_attempts
    BEFORE UPDATE OR DELETE ON notification_attempts
    FOR EACH ROW
    EXECUTE FUNCTION trg_reject_attempt_mutations();
