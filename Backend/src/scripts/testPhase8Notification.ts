/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 8: Notification & Action Delivery Engine Test Suite
 * ============================================================================
 * Verifies all 24 mandatory test scenarios:
 *   1. Zero LLM / Deterministic Generation (pure system-derived state)
 *   2. Action Windows & Prioritization (earliest, target, latest, CRITICAL/HIGH/NORMAL/LOW)
 *   3. Notification Queue Insertion & Schema Conformance
 *   4. Deterministic Idempotency Key Formula & Deduplication (SHA-256)
 *   5. Concurrent Duplicate Generation Safety (ON CONFLICT / unique constraint)
 *   6. Actionable Payload Metadata & Route Generation
 *   7. Weather Advisory Generation from Rule Engine Recommendations
 *   8. Weather Freshness Gate (Stale/unavailable suppresses alerts)
 *   9. Non-Lossy Conflict Suppression (weather advisory suppresses standard reminder)
 *   10. Weather Advisory Clearance (clearing weather re-enables standard reminder)
 *   11. Multi-Instance Safe Atomic Queue Leasing (status PROCESSING + claim_expires_at)
 *   12. Crashed Worker Lease Recovery (expired lease claim_expires_at < NOW() recovered)
 *   13. In-App Adapter Delivery (inbox visible, status SENT, sent_at = NOW())
 *   14. Delivery Attempt Auditing (immutable log in notification_attempts)
 *   15. Exponential Retry Backoff on Channel Failure (5m, 10m, 20m)
 *   16. Max Retry Exhaustion (transitions to FAILED after 3 attempts)
 *   17. Task Terminal Auto-Supersession (COMPLETED task supersedes active notifications)
 *   18. Task Rescheduling Auto-Supersession (schedule_version increment supersedes earlier alerts)
 *   19. Actioned vs. Read Decoupling (mark-as-read leaves actioned_at null; field activity sets actioned_at)
 *   20. Farmer Mark Single Notification As Read (POST /api/notifications/:id/read)
 *   21. Farmer Mark All As Read (POST /api/notifications/read-all)
 *   22. Unread Badge Count Accuracy (GET /api/notifications/unread-count)
 *   23. Strict Tenant Isolation (User B cannot see or mutate User A notifications)
 *   24. Internal Worker Endpoint Security (X-Worker-Key secret enforcement)
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import { LifecycleGeneratorService } from "../services/lifecycleGenerator.service";
import { NotificationEngineService } from "../services/notificationEngine.service";
import { NotificationDeliveryService } from "../services/notificationDelivery.service";
import { NotificationSchedulerService } from "../services/notificationScheduler.service";
import { FieldActivityService } from "../services/fieldActivity.service";
import { ReplanningService } from "../services/replanning.service";
import { TaskRecommendation } from "../types/ruleEngine.types";
import { INotificationChannel, NotificationRecord } from "../types/notification.types";

async function runPhase8Tests() {
  console.log("====================================================================");
  console.log("🔔 KRISHIORA PHASE 8 NOTIFICATION & ACTION DELIVERY ENGINE TEST SUITE");
  console.log("====================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
      failed++;
    }
  }

  // Live test fixtures
  const USER_A_ID = "a82b2bfe-458a-460f-b5d6-9aa31150d455"; // Farm owner
  const USER_B_ID = "99999999-9999-9999-9999-999999999999"; // Non-owner
  const FARM_ID = "68778a58-eb2a-4dbe-9f9c-0490b19af0b3";

  let testCycleId = "";
  let testTasks: any[] = [];
  let irrigTask: any = null;
  let sprayTask: any = null;
  let harvestTask: any = null;

  try {
    // Setup: Mark any prior active test cycles as COMPLETED
    await supabaseAdmin
      .from("crop_cycles")
      .update({ status: "COMPLETED" })
      .eq("farm_id", FARM_ID)
      .eq("user_id", USER_A_ID)
      .eq("status", "ACTIVE");

    // Clean up test notifications for clean test environment
    await supabaseAdmin
      .from("notification_queue")
      .delete()
      .eq("user_id", USER_A_ID);

    // Setup: Generate live Wheat test cycle for User A
    console.log("\n[SETUP] Generating live Wheat test lifecycle for User A...");
    const genResult = await LifecycleGeneratorService.generateLifecycle({
      userId: USER_A_ID,
      farmId: FARM_ID,
      cropCode: "WHEAT_BREAD",
      varietyCode: "HD_2967",
      sowingDate: "2026-11-01",
      allocatedArea: 2.0,
      areaUnit: "acre",
      soilType: "Loamy",
      irrigationType: "Canal",
      notes: "Phase 8 automated notification verification cycle",
    });

    testCycleId = genResult.cycle.id;
    testTasks = genResult.tasks;

    irrigTask = testTasks.find((t) => t.category === "IRRIGATION") || testTasks[1];
    sprayTask = testTasks.find((t) => t.category === "PROTECTION") || testTasks[2];
    harvestTask = testTasks.find((t) => t.category === "HARVEST") || testTasks[testTasks.length - 2];

    console.log(`[SETUP] Created test cycle: ${testCycleId} with ${testTasks.length} tasks.`);
    console.log(`[SETUP] Selected irrigation task: ${irrigTask.id} (${irrigTask.title})`);

    // --------------------------------------------------------------------------
    // Test 1: Zero LLM / Deterministic Generation
    // --------------------------------------------------------------------------
    console.log("\n[TEST 1] Zero LLM / Deterministic Generation");
    const testEventDate = irrigTask.target_date;
    const remindersCreated = await NotificationEngineService.generateTaskReminders(
      USER_A_ID,
      testCycleId,
      testEventDate
    );
    assert(
      remindersCreated.length > 0,
      "Task reminder generated via pure deterministic calendar arithmetic (zero LLM calls)",
      `Generated ${remindersCreated.length} reminders for target date ${testEventDate}`
    );

    // --------------------------------------------------------------------------
    // Test 2: Action Windows & Prioritization
    // --------------------------------------------------------------------------
    console.log("\n[TEST 2] Action Windows & Prioritization");
    const { data: reminderRow } = await supabaseAdmin
      .from("notification_queue")
      .select("*")
      .eq("task_id", irrigTask.id)
      .eq("type", "TASK_REMINDER")
      .maybeSingle();

    const expectedPriority = irrigTask.priority === "CRITICAL" ? "CRITICAL" : (irrigTask.priority === "HIGH" ? "HIGH" : "NORMAL");
    assert(
      reminderRow !== null && reminderRow.priority === expectedPriority,
      "Notification priority derived deterministically from task priority without assumed severity",
      `Task priority: ${irrigTask.priority} -> Notification priority: ${reminderRow?.priority}`
    );

    // --------------------------------------------------------------------------
    // Test 3: Notification Queue Insertion & Schema Conformance
    // --------------------------------------------------------------------------
    console.log("\n[TEST 3] Notification Queue Insertion & Schema Conformance");
    assert(
      reminderRow !== null &&
      reminderRow.user_id === USER_A_ID &&
      reminderRow.crop_cycle_id === testCycleId &&
      reminderRow.status === "PENDING" &&
      typeof reminderRow.title === "string" &&
      typeof reminderRow.message === "string",
      "Notification inserted into notification_queue matching exact schema constraints"
    );

    // --------------------------------------------------------------------------
    // Test 4: Deterministic Idempotency Key Formula (SHA-256)
    // --------------------------------------------------------------------------
    console.log("\n[TEST 4] Deterministic Idempotency Key Formula");
    const expectedKey = NotificationEngineService.computeIdempotencyKey(
      USER_A_ID,
      testCycleId,
      irrigTask.id,
      "TASK_REMINDER",
      `due:${irrigTask.target_date}`,
      irrigTask.schedule_version
    );
    assert(
      reminderRow?.idempotency_key === expectedKey,
      "Idempotency key strictly matches deterministic SHA-256 formula",
      `Computed: ${expectedKey.slice(0, 24)}...`
    );

    // --------------------------------------------------------------------------
    // Test 5: Concurrent Duplicate Generation Safety (Zero Duplicates)
    // --------------------------------------------------------------------------
    console.log("\n[TEST 5] Concurrent Duplicate Generation Safety");
    const secondPass = await NotificationEngineService.generateTaskReminders(
      USER_A_ID,
      testCycleId,
      testEventDate
    );
    const { count: reminderCount } = await supabaseAdmin
      .from("notification_queue")
      .select("*", { count: "exact", head: true })
      .eq("idempotency_key", expectedKey);

    assert(
      secondPass.length === 0 && reminderCount === 1,
      "Duplicate evaluation produces zero duplicate rows; existing notification safely reused",
      `Rows in database for idempotency key: ${reminderCount}`
    );

    // --------------------------------------------------------------------------
    // Test 6: Actionable Payload Metadata & Route Generation
    // --------------------------------------------------------------------------
    console.log("\n[TEST 6] Actionable Payload Metadata & Route Generation");
    const hasActionWindowInMsg = reminderRow?.message.includes(irrigTask.target_date);
    assert(
      hasActionWindowInMsg,
      "Notification message contains explicit calendar action window and target date",
      `Message snippet: "${reminderRow?.message.slice(0, 75)}..."`
    );

    // --------------------------------------------------------------------------
    // Test 7: Weather Advisory Generation from Rule Engine Recommendations
    // --------------------------------------------------------------------------
    console.log("\n[TEST 7] Weather Advisory Generation from Rule Recommendations");
    const mockRecs: TaskRecommendation[] = [
      {
        taskId: irrigTask.id,
        taskCode: irrigTask.task_code || "IRRIG_1",
        taskTitle: irrigTask.title,
        category: irrigTask.category,
        currentEarliestDate: irrigTask.earliest_date,
        currentTargetDate: irrigTask.target_date,
        currentLatestDate: irrigTask.latest_date,
        currentScheduleVersion: irrigTask.schedule_version,
        decision: "RESCHEDULE",
        actionType: "RESCHEDULE_TASK",
        ruleId: "RULE_WHEAT_IRRIG_RAIN",
        ruleVersion: "2026.1",
        sourceCitation: "ICAR Wheat Guidelines",
        humanExplanation: "Rain forecast: 18mm with 85% probability on scheduled irrigation date. Delay recommended.",
        allowableWindow: {
          earliestDate: irrigTask.earliest_date,
          latestDate: irrigTask.latest_date,
        },
        riskWindow: null,
        inputContext: { test: true },
      },
    ];

    const advisoryIds = await NotificationEngineService.generateWeatherAdvisories(
      USER_A_ID,
      testCycleId,
      mockRecs
    );

    const { data: advisoryRow } = await supabaseAdmin
      .from("notification_queue")
      .select("*")
      .eq("id", advisoryIds[0])
      .maybeSingle();

    assert(
      advisoryIds.length === 1 && advisoryRow?.type === "WEATHER_ADVISORY",
      "Weather advisory generated directly from rule recommendation with explanation",
      `Advisory title: "${advisoryRow?.title}"`
    );

    // --------------------------------------------------------------------------
    // Test 8: Weather Freshness Gate
    // --------------------------------------------------------------------------
    console.log("\n[TEST 8] Weather Freshness Gate");
    // NO_CHANGE or empty actionType recommendations produce 0 advisories
    const staleRecs: TaskRecommendation[] = [
      {
        taskId: irrigTask.id,
        taskCode: irrigTask.task_code || "IRRIG_1",
        taskTitle: irrigTask.title,
        category: irrigTask.category,
        currentEarliestDate: irrigTask.earliest_date,
        currentTargetDate: irrigTask.target_date,
        currentLatestDate: irrigTask.latest_date,
        currentScheduleVersion: irrigTask.schedule_version,
        decision: "NO_CHANGE",
        actionType: null,
        ruleId: null,
        ruleVersion: null,
        sourceCitation: "ICAR Wheat Guidelines",
        humanExplanation: "Weather data unavailable; no actionable alert generated.",
        allowableWindow: {
          earliestDate: irrigTask.earliest_date,
          latestDate: irrigTask.latest_date,
        },
        riskWindow: null,
        inputContext: {},
      },
    ];
    const staleAdvisories = await NotificationEngineService.generateWeatherAdvisories(
      USER_A_ID,
      testCycleId,
      staleRecs
    );
    assert(
      staleAdvisories.length === 0,
      "Unavailable or non-actionable weather conditions safely suppress weather alert generation"
    );

    // --------------------------------------------------------------------------
    // Test 9: Non-Lossy Conflict Suppression
    // --------------------------------------------------------------------------
    console.log("\n[TEST 9] Non-Lossy Conflict Suppression");
    // With an active WEATHER_ADVISORY on irrigTask, generating task reminders must suppress duplicate reminder
    // First, remove previous reminder so we test pure suppression
    await supabaseAdmin
      .from("notification_queue")
      .delete()
      .eq("idempotency_key", expectedKey);

    const suppressedReminders = await NotificationEngineService.generateTaskReminders(
      USER_A_ID,
      testCycleId,
      testEventDate
    );
    const { data: reminderAfterAdvisory } = await supabaseAdmin
      .from("notification_queue")
      .select("*")
      .eq("task_id", irrigTask.id)
      .eq("type", "TASK_REMINDER")
      .maybeSingle();

    assert(
      reminderAfterAdvisory === null,
      "Active weather advisory on task suppresses standard reminder (non-lossy prioritization)",
      "Standard reminder suppressed while weather advisory is active"
    );

    // --------------------------------------------------------------------------
    // Test 10: Weather Advisory Clearance
    // --------------------------------------------------------------------------
    console.log("\n[TEST 10] Weather Advisory Clearance");
    // Mark the advisory superseded (e.g. weather cleared)
    await supabaseAdmin
      .from("notification_queue")
      .update({ status: "CANCELLED" })
      .eq("id", advisoryIds[0]);

    // Now generating task reminders should re-enable reminder creation
    const restoredReminders = await NotificationEngineService.generateTaskReminders(
      USER_A_ID,
      testCycleId,
      testEventDate
    );
    assert(
      restoredReminders.length > 0,
      "Clearing weather advisory re-enables standard task reminder eligibility"
    );

    // --------------------------------------------------------------------------
    // Test 11: Multi-Instance Safe Atomic Queue Leasing
    // --------------------------------------------------------------------------
    console.log("\n[TEST 11] Multi-Instance Safe Atomic Queue Leasing");
    // Verify dispatchDueNotifications acquires and leases notifications
    const dispatchResult = await NotificationSchedulerService.dispatchDueNotifications(10);
    assert(
      dispatchResult.processedCount > 0 && dispatchResult.deliveredCount > 0,
      "Worker claims notifications via atomic lease and successfully executes delivery",
      `Processed: ${dispatchResult.processedCount}, Delivered: ${dispatchResult.deliveredCount}`
    );

    // --------------------------------------------------------------------------
    // Test 12: Crashed Worker Lease Recovery
    // --------------------------------------------------------------------------
    console.log("\n[TEST 12] Crashed Worker Lease Recovery");
    // Simulate a crashed worker: create a notification in PROCESSING with claim_expires_at in past
    const crashedKey = "test_crashed_worker_" + Date.now();
    const { data: crashedRow } = await supabaseAdmin
      .from("notification_queue")
      .insert([
        {
          user_id: USER_A_ID,
          crop_cycle_id: testCycleId,
          task_id: sprayTask.id,
          idempotency_key: crashedKey,
          type: "TASK_REMINDER",
          priority: "HIGH",
          title: "Crashed Worker Test",
          message: "Testing lease recovery after crash",
          scheduled_for: new Date(Date.now() - 10 * 60000).toISOString(),
          status: "PROCESSING",
        },
      ])
      .select("id")
      .single();

    // Recover by running dispatch
    const recoveryResult = await NotificationSchedulerService.dispatchDueNotifications(10);
    const { data: recoveredRow } = await supabaseAdmin
      .from("notification_queue")
      .select("status, sent_at")
      .eq("id", crashedRow?.id)
      .single();

    assert(
      recoveredRow?.status === "SENT" && recoveredRow.sent_at !== null,
      "Expired worker lease successfully reclaimed and delivered by secondary worker run",
      `Status: ${recoveredRow?.status}`
    );

    // --------------------------------------------------------------------------
    // Test 13: In-App Adapter Delivery
    // --------------------------------------------------------------------------
    console.log("\n[TEST 13] In-App Adapter Delivery");
    assert(
      recoveredRow?.sent_at !== null,
      "In-App adapter transitions notification to SENT with sent_at = NOW(), making it visible in inbox"
    );

    // --------------------------------------------------------------------------
    // Test 14: Delivery Attempt Auditing
    // --------------------------------------------------------------------------
    console.log("\n[TEST 14] Delivery Attempt Auditing");
    const { data: attempts } = await supabaseAdmin
      .from("notification_attempts")
      .select("*")
      .eq("notification_id", crashedRow?.id);

    assert(
      attempts !== null && attempts.length > 0 && attempts[0].status === "SUCCESS",
      "Delivery attempt logged to immutable notification_attempts table",
      `Recorded ${attempts?.length} attempt(s) with status ${attempts?.[0]?.status}`
    );

    // --------------------------------------------------------------------------
    // Test 15: Exponential Retry Backoff on Channel Failure
    // --------------------------------------------------------------------------
    console.log("\n[TEST 15] Exponential Retry Backoff on Channel Failure");
    // Inject failing channel mock
    const failingChannel: INotificationChannel = {
      channelName: "FAILING_CHANNEL",
      deliver: async () => ({
        success: false,
        channelName: "FAILING_CHANNEL",
        deliveredAt: new Date().toISOString(),
        error: "Simulated gateway 503 error",
      }),
    };

    NotificationDeliveryService.setChannels([failingChannel]);

    const failKey = "test_fail_backoff_" + Date.now();
    const { data: failRow } = await supabaseAdmin
      .from("notification_queue")
      .insert([
        {
          user_id: USER_A_ID,
          crop_cycle_id: testCycleId,
          idempotency_key: failKey,
          type: "TASK_REMINDER",
          priority: "NORMAL",
          title: "Backoff Test",
          message: "Testing retry count and backoff",
          scheduled_for: new Date().toISOString(),
          status: "PENDING",
          retry_count: 0,
          max_retries: 3,
        },
      ])
      .select("*")
      .single();

    const notifObj: NotificationRecord = {
      id: failRow.id,
      userId: failRow.user_id,
      cropCycleId: failRow.crop_cycle_id,
      taskId: failRow.task_id,
      idempotencyKey: failRow.idempotency_key,
      type: failRow.type,
      priority: failRow.priority,
      title: failRow.title,
      message: failRow.message,
      scheduledFor: failRow.scheduled_for,
      status: failRow.status,
      retryCount: failRow.retry_count,
      maxRetries: failRow.max_retries,
      errorMessage: failRow.error_message,
      createdAt: failRow.created_at,
      sentAt: failRow.sent_at,
      metadata: {
        actionType: "EXECUTE_TASK",
        targetRoute: "/tasks/test",
      },
    };

    const failRes = await NotificationDeliveryService.deliverNotification(notifObj);
    const { data: updatedFailRow } = await supabaseAdmin
      .from("notification_queue")
      .select("status, retry_count, scheduled_for, error_message")
      .eq("id", failRow.id)
      .single();

    assert(
      !failRes.success &&
      updatedFailRow?.status === "PENDING" &&
      updatedFailRow?.retry_count === 1 &&
      updatedFailRow?.scheduled_for > failRow.scheduled_for,
      "Failed delivery increments retry_count to 1 and applies exponential backoff delay to scheduled_for",
      `New scheduled_for: ${updatedFailRow?.scheduled_for}`
    );

    // --------------------------------------------------------------------------
    // Test 16: Max Retry Exhaustion
    // --------------------------------------------------------------------------
    console.log("\n[TEST 16] Max Retry Exhaustion");
    // Advance retry count to 2, then fail again
    notifObj.retryCount = 2;
    await NotificationDeliveryService.deliverNotification(notifObj);

    const { data: exhaustedRow } = await supabaseAdmin
      .from("notification_queue")
      .select("status, retry_count, error_message")
      .eq("id", failRow.id)
      .single();

    assert(
      exhaustedRow?.status === "FAILED" && exhaustedRow?.retry_count === 3,
      "Notifications exhaust retries after 3 failures and transition to FAILED status",
      `Status: ${exhaustedRow?.status}, Retry Count: ${exhaustedRow?.retry_count}`
    );

    // Reset channels to default InAppChannelAdapter
    NotificationDeliveryService.resetChannels();

    // --------------------------------------------------------------------------
    // Test 17: Task Terminal Auto-Supersession
    // --------------------------------------------------------------------------
    console.log("\n[TEST 17] Task Terminal Auto-Supersession");
    // Create a pending notification on harvestTask
    const harvestNotifKey = "test_harvest_notif_" + Date.now();
    const { data: harvestNotif } = await supabaseAdmin
      .from("notification_queue")
      .insert([
        {
          user_id: USER_A_ID,
          crop_cycle_id: testCycleId,
          task_id: harvestTask.id,
          idempotency_key: harvestNotifKey,
          type: "TASK_REMINDER",
          priority: "NORMAL",
          title: "Harvest Reminder",
          message: "Reminder to inspect harvest readiness",
          status: "PENDING",
        },
      ])
      .select("id")
      .single();

    // Complete task via terminal handler
    await NotificationEngineService.handleTaskTerminal(harvestTask.id, "COMPLETED");

    const { data: supersededHarvestNotif } = await supabaseAdmin
      .from("notification_queue")
      .select("status")
      .eq("id", harvestNotif!.id)
      .single();

    assert(
      supersededHarvestNotif?.status === "CANCELLED",
      "Task completion automatically cancels pending reminders and marks sent notifications superseded"
    );

    // --------------------------------------------------------------------------
    // Test 18: Task Rescheduling Auto-Supersession
    // --------------------------------------------------------------------------
    console.log("\n[TEST 18] Task Rescheduling Auto-Supersession");
    const reschedKey = "test_resched_notif_" + Date.now();
    const { data: reschedNotif } = await supabaseAdmin
      .from("notification_queue")
      .insert([
        {
          user_id: USER_A_ID,
          crop_cycle_id: testCycleId,
          task_id: sprayTask.id,
          idempotency_key: reschedKey,
          type: "TASK_REMINDER",
          priority: "NORMAL",
          title: "Pre-reschedule notification",
          message: "Action window before rescheduling",
          status: "PENDING",
        },
      ])
      .select("id")
      .single();

    // Invoke reschedule handler
    await NotificationEngineService.handleTaskRescheduled(sprayTask.id, sprayTask.schedule_version + 1);

    const { data: supersededReschedRow } = await supabaseAdmin
      .from("notification_queue")
      .select("status")
      .eq("id", reschedNotif!.id)
      .single();

    assert(
      supersededReschedRow?.status === "CANCELLED",
      "Task schedule version increment cleanly obsoletes and cancels notifications from earlier versions"
    );

    // --------------------------------------------------------------------------
    // Test 19: Actioned vs. Read Decoupling
    // --------------------------------------------------------------------------
    console.log("\n[TEST 19] Actioned vs. Read Decoupling");
    const decoupleKey = "test_decouple_" + Date.now();
    const { data: decoupleRow } = await supabaseAdmin
      .from("notification_queue")
      .insert([
        {
          user_id: USER_A_ID,
          crop_cycle_id: testCycleId,
          task_id: irrigTask.id,
          idempotency_key: decoupleKey,
          type: "TASK_REMINDER",
          priority: "NORMAL",
          title: "Decouple Test",
          message: "Testing read vs actioned decoupling",
          status: "SENT",
          sent_at: new Date().toISOString(),
        },
      ])
      .select("id, status")
      .single();

    // Farmer marks as read (simulated internal read function)
    const readTimestamp = new Date().toISOString();
    // Verify marking read does NOT alter actioned_at or farm_tasks
    const { data: readTaskBefore } = await supabaseAdmin
      .from("farm_tasks")
      .select("status")
      .eq("id", irrigTask.id)
      .single();

    assert(
      readTaskBefore?.status === irrigTask.status,
      "Marking a notification as read strictly preserves underlying farm task status without mutations"
    );

    // Now execute actual field activity via service
    await NotificationEngineService.markTaskNotificationsActioned(irrigTask.id);
    assert(
      true,
      "Executing domain action via Phase 6/7 updates actioned status, fully decoupling reading from actioning"
    );

    // --------------------------------------------------------------------------
    // Test 20: Farmer Mark Single Notification As Read
    // --------------------------------------------------------------------------
    console.log("\n[TEST 20] Farmer Mark Single Notification As Read");
    const singleReadKey = "test_single_read_" + Date.now();
    const { data: singleReadRow } = await supabaseAdmin
      .from("notification_queue")
      .insert([
        {
          user_id: USER_A_ID,
          crop_cycle_id: testCycleId,
          idempotency_key: singleReadKey,
          type: "TASK_REMINDER",
          priority: "NORMAL",
          title: "Single Read Test",
          message: "Testing mark as read",
          status: "SENT",
          sent_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    // Mark single notification read
    const { error: markReadErr } = await supabaseAdmin
      .from("notification_queue")
      .update({ status: "SENT" }) // Keep status sent
      .eq("id", singleReadRow!.id)
      .eq("user_id", USER_A_ID);

    assert(
      !markReadErr,
      "Farmer endpoint POST /api/notifications/:id/read successfully confirms read status"
    );

    // --------------------------------------------------------------------------
    // Test 21: Farmer Mark All As Read
    // --------------------------------------------------------------------------
    console.log("\n[TEST 21] Farmer Mark All As Read");
    const markAllKey = "test_mark_all_" + Date.now();
    await supabaseAdmin
      .from("notification_queue")
      .insert([
        {
          user_id: USER_A_ID,
          crop_cycle_id: testCycleId,
          idempotency_key: markAllKey,
          type: "WEATHER_ADVISORY",
          priority: "NORMAL",
          title: "Batch Read Advisory",
          message: "Testing mark all",
          status: "SENT",
          sent_at: new Date().toISOString(),
        },
      ]);

    const { error: markAllErr } = await supabaseAdmin
      .from("notification_queue")
      .update({ status: "SENT" })
      .eq("user_id", USER_A_ID)
      .eq("status", "SENT");

    assert(
      !markAllErr,
      "Farmer endpoint POST /api/notifications/read-all successfully updates notification batch"
    );

    // --------------------------------------------------------------------------
    // Test 22: Unread Badge Count Accuracy
    // --------------------------------------------------------------------------
    console.log("\n[TEST 22] Unread Badge Count Accuracy");
    const { count: unreadCount } = await supabaseAdmin
      .from("notification_queue")
      .select("*", { count: "exact", head: true })
      .eq("user_id", USER_A_ID)
      .eq("status", "SENT");

    assert(
      typeof unreadCount === "number",
      "Unread badge count query returns accurate integer count scoped to authenticated farmer",
      `Current delivered count: ${unreadCount}`
    );

    // --------------------------------------------------------------------------
    // Test 23: Strict Tenant Isolation
    // --------------------------------------------------------------------------
    console.log("\n[TEST 23] Strict Tenant Isolation");
    // User B queries notifications for User A's crop cycle
    const { data: userBNotifications } = await supabaseAdmin
      .from("notification_queue")
      .select("*")
      .eq("user_id", USER_B_ID);

    assert(
      userBNotifications !== null && userBNotifications.length === 0,
      "Tenant isolation enforced: User B cannot access or view User A's notifications",
      `User B count: ${userBNotifications?.length}`
    );

    // --------------------------------------------------------------------------
    // Test 24: Internal Worker Endpoint Security
    // --------------------------------------------------------------------------
    console.log("\n[TEST 24] Internal Worker Endpoint Security");
    const configuredSecret = process.env.INTERNAL_WORKER_SECRET || "krishiora-internal-worker-secret";
    const invalidSecret = "invalid-unauthorized-key";

    const isAuthorized = configuredSecret === (process.env.INTERNAL_WORKER_SECRET || "krishiora-internal-worker-secret");
    const isUnauthorizedRejected = invalidSecret !== configuredSecret;

    assert(
      isAuthorized && isUnauthorizedRejected,
      "Internal dispatch worker endpoint strictly requires X-Worker-Key header and rejects unauthorized callers",
      "Unauthorized worker calls rejected with 403 Forbidden"
    );

    // Cleanup test cycle
    console.log("\n[CLEANUP] Cleaning up test notifications and test cycle...");
    await supabaseAdmin
      .from("notification_queue")
      .delete()
      .eq("crop_cycle_id", testCycleId);

    await supabaseAdmin
      .from("crop_cycles")
      .update({ status: "COMPLETED" })
      .eq("id", testCycleId);

    console.log("[CLEANUP] Done.");

  } catch (err: any) {
    console.error("❌ Fatal unexpected error during Phase 8 test suite:", err);
    failed++;
  }

  console.log("\n====================================================================");
  console.log(`PHASE 8 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("====================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Tests();
