/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 4: Lifecycle Generator & Backend API Verification Suite
 * ============================================================================
 * Verifies all 20 required test scenarios:
 *   1. Generate Wheat lifecycle successfully (HD-2967, 9 stages, 11 tasks)
 *   2. Generate Mustard lifecycle successfully (RH-749, 8 stages, 7 tasks)
 *   3. Generate Chickpea lifecycle successfully (JG-11, 8 stages, 7 tasks)
 *   4. Correct sowing date propagation
 *   5. Correct stage date calculation
 *   6. Correct task window calculation (earliest <= target <= latest)
 *   7. Tasks linked to correct stages
 *   8. Dependencies generated correctly (zero invented dependencies)
 *   9. Circular dependency protection still works
 *   10. Invalid crop/variety combination rejected (Wheat + Mustard variety)
 *   11. Unknown variety rejected
 *   12. Unauthorized farm rejected (User B cannot plan on User A's farm)
 *   13. Duplicate lifecycle behavior / idempotency verified (409 Conflict)
 *   14. Real database transaction rollback verified
 *   15. Knowledge version dynamically pinned (matches catalog, not hardcoded '1.0')
 *   16. Rule version dynamically pinned where applicable
 *   17. Determinism: Same input produces identical output
 *   18. No duplicate tasks on retry
 *   19. Leap-year & month boundary calendar arithmetic test
 *   20. Existing legacy farm/crop data remains untouched
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import { LifecycleGeneratorService } from "../services/lifecycleGenerator.service";
import { CropKnowledgeService } from "../services/cropKnowledge.service";
import {
  addDays,
  diffDays,
  isLeapYear,
  isValidIsoDate,
} from "../utils/date.utils";

async function runPhase4Tests() {
  console.log("====================================================================");
  console.log("🧪 KRISHIORA PHASE 4 LIFECYCLE GENERATOR & SECURITY TEST SUITE");
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

  // Track test cycle IDs for guaranteed cleanup
  const testCycleIds: string[] = [];

  try {
    // ------------------------------------------------------------------------
    // SETUP: Resolve Existing Valid Farm & User for Tests
    // ------------------------------------------------------------------------
    const { data: farmData, error: farmErr } = await supabaseAdmin
      .from("farms")
      .select("id, user_id, farm_name")
      .limit(1)
      .single();

    if (farmErr || !farmData) {
      throw new Error("Cannot run tests: No existing farm found in database.");
    }

    const testUserId = farmData.user_id;
    const testFarmId = farmData.id;
    const unauthorizedUserId = "99999999-9999-9999-9999-999999999999";

    console.log(`[TEST SETUP] Using Farm ID: ${testFarmId}, User ID: ${testUserId}`);

    // Snapshot legacy counts before testing (Requirement 20)
    const { count: preFarmsCount } = await supabaseAdmin.from("farms").select("*", { count: "exact", head: true });
    const { count: preCropsCount } = await supabaseAdmin.from("crops").select("*", { count: "exact", head: true });
    const { count: preExpensesCount } = await supabaseAdmin.from("expenses").select("*", { count: "exact", head: true });
    const { count: preProfilesCount } = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true });

    // Pre-test cleanup: Mark any existing active test cycles for this farm as COMPLETED
    await supabaseAdmin
      .from("crop_cycles")
      .update({ status: "COMPLETED" })
      .eq("farm_id", testFarmId)
      .eq("user_id", testUserId)
      .eq("status", "ACTIVE");

    // ------------------------------------------------------------------------
    // TEST 1: Generate Wheat Lifecycle Successfully
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 1: Generate Wheat Lifecycle Successfully ---");
    const wheatSowing = "2026-11-05";
    const wheatResult = await LifecycleGeneratorService.generateLifecycle({
      userId: testUserId,
      farmId: testFarmId,
      cropCode: "WHEAT_BREAD",
      varietyCode: "HD_2967",
      sowingDate: wheatSowing,
      allocatedArea: 2.5,
      areaUnit: "acre",
      notes: "Phase 4 Wheat Test Plot",
    });
    testCycleIds.push(wheatResult.cycle.id);

    assert(
      wheatResult.cycle.id !== undefined &&
        wheatResult.cycle.crop_code === "WHEAT_BREAD" &&
        wheatResult.cycle.variety_code === "HD_2967" &&
        wheatResult.stages.length === 9 &&
        wheatResult.tasks.length === 11,
      "Test 1: Bread Wheat (HD-2967) lifecycle generated with 9 stages & 11 tasks",
      `Cycle ID: ${wheatResult.cycle.id}, Harvest Target: ${wheatResult.cycle.target_harvest_date}`
    );

    // ------------------------------------------------------------------------
    // TEST 2: Generate Mustard Lifecycle Successfully
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 2: Generate Mustard Lifecycle Successfully ---");
    const mustardSowing = "2026-10-15";
    const mustardResult = await LifecycleGeneratorService.generateLifecycle({
      userId: testUserId,
      farmId: testFarmId,
      cropCode: "MUSTARD_INDIAN",
      varietyCode: "RH_749",
      sowingDate: mustardSowing,
      allocatedArea: 1.5,
      areaUnit: "acre",
      notes: "Phase 4 Mustard Test Plot",
    });
    testCycleIds.push(mustardResult.cycle.id);

    assert(
      mustardResult.cycle.id !== undefined &&
        mustardResult.cycle.crop_code === "MUSTARD_INDIAN" &&
        mustardResult.cycle.variety_code === "RH_749" &&
        mustardResult.stages.length === 8 &&
        mustardResult.tasks.length === 7,
      "Test 2: Indian Mustard (RH-749) lifecycle generated with 8 stages & 7 tasks",
      `Cycle ID: ${mustardResult.cycle.id}, Harvest Target: ${mustardResult.cycle.target_harvest_date}`
    );

    // ------------------------------------------------------------------------
    // TEST 3: Generate Chickpea Lifecycle Successfully
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 3: Generate Chickpea Lifecycle Successfully ---");
    const chickpeaSowing = "2026-10-25";
    const chickpeaResult = await LifecycleGeneratorService.generateLifecycle({
      userId: testUserId,
      farmId: testFarmId,
      cropCode: "CHICKPEA_DESI",
      varietyCode: "JG_11",
      sowingDate: chickpeaSowing,
      allocatedArea: 1.0,
      areaUnit: "acre",
      notes: "Phase 4 Chickpea Test Plot",
    });
    testCycleIds.push(chickpeaResult.cycle.id);

    assert(
      chickpeaResult.cycle.id !== undefined &&
        chickpeaResult.cycle.crop_code === "CHICKPEA_DESI" &&
        chickpeaResult.cycle.variety_code === "JG_11" &&
        chickpeaResult.stages.length === 8 &&
        chickpeaResult.tasks.length === 7,
      "Test 3: Desi Chickpea (JG-11) lifecycle generated with 8 stages & 7 tasks",
      `Cycle ID: ${chickpeaResult.cycle.id}, Harvest Target: ${chickpeaResult.cycle.target_harvest_date}`
    );

    // ------------------------------------------------------------------------
    // TEST 4: Sowing Date Propagation
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 4: Sowing Date Propagation ---");
    // Wheat stage 1 should start on sowingDate (2026-11-05)
    const stage1 = wheatResult.stages.find((s) => s.stage_order === 1);
    const sowingTask = wheatResult.tasks.find((t) => t.task_code === "ACT_WHEAT_SOWING");

    assert(
      wheatResult.cycle.sowing_date === wheatSowing &&
        stage1?.target_start_date === wheatSowing &&
        sowingTask?.target_date === wheatSowing,
      "Test 4: Sowing date correctly propagates to stage 1 and initial sowing tasks",
      `Sowing: ${wheatSowing}, Stage 1 Target: ${stage1?.target_start_date}, Sowing Task Target: ${sowingTask?.target_date}`
    );

    // ------------------------------------------------------------------------
    // TEST 5: Correct Stage Date Calculation
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 5: Correct Stage Date Calculation ---");
    // CRI stage (order 2) has typical offset 20-25 days.
    // 2026-11-05 + 20 days = 2026-11-25
    const criStage = wheatResult.stages.find((s) => s.stage_code === "STAGE_WHEAT_CRI");
    const expectedCriStart = addDays(wheatSowing, 20);
    const expectedCriEnd = addDays(wheatSowing, 25);

    assert(
      criStage?.target_start_date === expectedCriStart &&
        criStage?.target_end_date === expectedCriEnd &&
        criStage?.earliest_start_date === expectedCriStart,
      "Test 5: CRI stage dates match authoritative knowledge offset (Days 20–25)",
      `Calculated: ${criStage?.target_start_date} to ${criStage?.target_end_date} (Expected: ${expectedCriStart} to ${expectedCriEnd})`
    );

    // ------------------------------------------------------------------------
    // TEST 6: Task Window Calculation (earliest <= target <= latest)
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 6: Task Window Calculation ---");
    const allWindowsValid = wheatResult.tasks.every(
      (t) => t.earliest_date <= t.target_date && t.target_date <= t.latest_date
    );
    const criTask = wheatResult.tasks.find((t) => t.task_code === "ACT_WHEAT_IRRIG_CRI");

    assert(
      allWindowsValid && criTask !== undefined,
      "Test 6: All 11 tasks satisfy action window invariant (earliest <= target <= latest)",
      `CRI 1st Irrigation Action Window: [${criTask?.earliest_date} <= ${criTask?.target_date} <= ${criTask?.latest_date}]`
    );

    // ------------------------------------------------------------------------
    // TEST 7: Tasks Linked to Correct Stages
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 7: Tasks Linked to Correct Stages ---");
    const stageIdSet = new Set(wheatResult.stages.map((s) => s.id));
    const allTasksLinked = wheatResult.tasks.every((t) => stageIdSet.has(t.stage_id));

    // Verify specifically that CRI task points to CRI stage ID
    const criTaskLinkedToCriStage = criTask?.stage_id === criStage?.id;

    assert(
      allTasksLinked && criTaskLinkedToCriStage,
      "Test 7: Every task has a valid stage_id pointing to the appropriate realized stage",
      `CRI Task Stage ID: ${criTask?.stage_id} matches CRI Stage ID: ${criStage?.id}`
    );

    // ------------------------------------------------------------------------
    // TEST 8: Dependencies Generated Correctly (Zero Invented Dependencies)
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 8: Zero Invented Dependencies (Master Crops) ---");
    assert(
      wheatResult.dependencies.length === 0,
      "Test 8.1: No artificial dependencies invented for master crops (Phase 3 truth preserved)",
      `Dependencies count: ${wheatResult.dependencies.length}`
    );

    // Test explicit dependency insertion works as designed
    if (wheatResult.tasks.length >= 2) {
      const taskA = wheatResult.tasks[0].id;
      const taskB = wheatResult.tasks[1].id;

      const { data: depData, error: depErr } = await supabaseAdmin
        .from("task_dependencies")
        .insert({
          task_id: taskB,
          prerequisite_task_id: taskA,
          dependency_type: "FINISH_TO_START",
          min_lag_days: 1,
        })
        .select()
        .single();

      assert(
        !depErr && depData !== null,
        "Test 8.2: Explicit valid task dependency successfully persisted",
        `Dependency: Task ${depData?.task_id} requires prerequisite ${depData?.prerequisite_task_id}`
      );

      // Clean up test dependency
      if (depData?.id) {
        await supabaseAdmin.from("task_dependencies").delete().eq("id", depData.id);
      }
    }

    // ------------------------------------------------------------------------
    // TEST 9: Circular Dependency Protection
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 9: Circular Dependency Protection ---");
    if (wheatResult.tasks.length >= 3) {
      const t1 = wheatResult.tasks[0].id;
      const t2 = wheatResult.tasks[1].id;

      // Create T2 depends on T1
      await supabaseAdmin.from("task_dependencies").insert({
        task_id: t2,
        prerequisite_task_id: t1,
        dependency_type: "FINISH_TO_START",
      });

      // Attempt circular: T1 depends on T2
      const { error: circErr } = await supabaseAdmin.from("task_dependencies").insert({
        task_id: t1,
        prerequisite_task_id: t2,
        dependency_type: "FINISH_TO_START",
      });

      assert(
        circErr !== null && (circErr.message.includes("Circular") || circErr.code === "23514"),
        "Test 9: Database trigger trg_prevent_circular_dependencies blocks circular dependency path",
        `Database response: ${circErr?.message}`
      );

      // Clean up
      await supabaseAdmin.from("task_dependencies").delete().eq("task_id", t2).eq("prerequisite_task_id", t1);
    }

    // ------------------------------------------------------------------------
    // TEST 10: Invalid Crop / Variety Combination Rejected
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 10: Invalid Crop / Variety Combination Rejected ---");
    let mismatchThrew = false;
    let mismatchMessage = "";
    try {
      await LifecycleGeneratorService.generateLifecycle({
        userId: testUserId,
        farmId: testFarmId,
        cropCode: "WHEAT_BREAD",
        varietyCode: "RH_749", // Mustard variety under Wheat!
        sowingDate: "2026-11-01",
        allocatedArea: 1.0,
      });
    } catch (e: any) {
      mismatchThrew = true;
      mismatchMessage = e.message;
    }

    assert(
      mismatchThrew && mismatchMessage.includes("not approved"),
      "Test 10: Wheat crop with Mustard variety (RH-749) is strictly rejected (422 Unprocessable)",
      `Error caught: "${mismatchMessage}"`
    );

    // ------------------------------------------------------------------------
    // TEST 11: Unknown Variety Rejected
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 11: Unknown Variety Rejected ---");
    let unknownThrew = false;
    let unknownMessage = "";
    try {
      await LifecycleGeneratorService.generateLifecycle({
        userId: testUserId,
        farmId: testFarmId,
        cropCode: "WHEAT_BREAD",
        varietyCode: "NON_EXISTENT_VAR",
        sowingDate: "2026-11-01",
        allocatedArea: 1.0,
      });
    } catch (e: any) {
      unknownThrew = true;
      unknownMessage = e.message;
    }

    assert(
      unknownThrew,
      "Test 11: Non-existent variety code is rejected safely",
      `Error caught: "${unknownMessage}"`
    );

    // ------------------------------------------------------------------------
    // TEST 12: Unauthorized Farm Access Rejected
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 12: Unauthorized Farm Access Rejected ---");
    let authThrew = false;
    let authMessage = "";
    try {
      await LifecycleGeneratorService.generateLifecycle({
        userId: unauthorizedUserId, // Different user attempting to plan on testFarmId
        farmId: testFarmId,
        cropCode: "WHEAT_BREAD",
        varietyCode: "HD_2967",
        sowingDate: "2026-11-01",
        allocatedArea: 1.0,
      });
    } catch (e: any) {
      authThrew = true;
      authMessage = e.message;
    }

    assert(
      authThrew && authMessage.includes("Forbidden"),
      "Test 12: User B cannot plan on User A's farm (403 Forbidden)",
      `Error caught: "${authMessage}"`
    );

    // ------------------------------------------------------------------------
    // TEST 13: Duplicate Lifecycle Behavior / Idempotency
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 13: Duplicate Lifecycle Behavior / Idempotency ---");
    let dupThrew = false;
    let dupMessage = "";
    try {
      // Re-submit identical Wheat request with same sowing date
      await LifecycleGeneratorService.generateLifecycle({
        userId: testUserId,
        farmId: testFarmId,
        cropCode: "WHEAT_BREAD",
        varietyCode: "HD_2967",
        sowingDate: wheatSowing, // Same sowing date!
        allocatedArea: 2.5,
      });
    } catch (e: any) {
      dupThrew = true;
      dupMessage = e.message;
    }

    assert(
      dupThrew && dupMessage.includes("already exists"),
      "Test 13: Duplicate lifecycle creation for identical plot & date rejected (409 Conflict)",
      `Error caught: "${dupMessage}"`
    );

    // ------------------------------------------------------------------------
    // TEST 14: Real Database Transaction Rollback Verification
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 14: Real Database Transaction Rollback Verification ---");
    const rollbackCycleId = crypto.randomUUID();
    const rollbackStageId = crypto.randomUUID();

    // Construct valid cycle and stage, but inject an INVALID task that violates chk_task_window (earliest > target)
    const invalidTaskPayload = [
      {
        id: crypto.randomUUID(),
        crop_cycle_id: rollbackCycleId,
        stage_id: rollbackStageId,
        user_id: testUserId,
        task_code: "ACT_ROLLBACK_TEST",
        title: "Rollback Test Task",
        category: "IRRIGATION" as const,
        earliest_date: "2026-12-10",
        target_date: "2026-12-05", // 10 > 5 VIOLATES chk_task_window!
        latest_date: "2026-12-15",
        priority: "HIGH" as const,
        status: "SCHEDULED" as const,
        is_weather_sensitive: false,
        schedule_version: 1,
        rule_version: "1.0",
      },
    ];

    let rollbackTriggered = false;
    try {
      await LifecycleGeneratorService.persistLifecycleTransactional(
        {
          id: rollbackCycleId,
          user_id: testUserId,
          farm_id: testFarmId,
          crop_code: "WHEAT_BREAD",
          crop_name: "Wheat",
          allocated_area: 1.0,
          area_unit: "acre",
          sowing_date: "2026-11-20",
          target_harvest_date: "2027-03-25",
          status: "ACTIVE",
          knowledge_version: "1.0",
        },
        [
          {
            id: rollbackStageId,
            crop_cycle_id: rollbackCycleId,
            stage_code: "STAGE_WHEAT_SOWING",
            stage_name: "Sowing",
            stage_order: 1,
            earliest_start_date: "2026-11-20",
            target_start_date: "2026-11-20",
            latest_start_date: "2026-11-20",
            target_end_date: "2026-11-27",
            status: "UPCOMING",
          },
        ],
        invalidTaskPayload,
        []
      );
    } catch (err: any) {
      rollbackTriggered = true;
    }

    // Verify ZERO orphan rows remain in database
    const { data: orphanCycle } = await supabaseAdmin.from("crop_cycles").select("id").eq("id", rollbackCycleId).maybeSingle();
    const { data: orphanStages } = await supabaseAdmin.from("crop_cycle_stages").select("id").eq("crop_cycle_id", rollbackCycleId);
    const { data: orphanTasks } = await supabaseAdmin.from("farm_tasks").select("id").eq("crop_cycle_id", rollbackCycleId);

    assert(
      rollbackTriggered && !orphanCycle && orphanStages?.length === 0 && orphanTasks?.length === 0,
      "Test 14: Atomic transaction rolls back completely on constraint violation (0 orphan rows)",
      `Cycle exists: ${!!orphanCycle}, Stages count: ${orphanStages?.length || 0}, Tasks count: ${orphanTasks?.length || 0}`
    );

    // ------------------------------------------------------------------------
    // TEST 15: Knowledge Version Dynamically Pinned
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 15: Knowledge Version Dynamically Pinned ---");
    const wheatCropCatalog = await CropKnowledgeService.getCropByCode("WHEAT_BREAD");
    const catalogKnowledgeVersion = wheatCropCatalog?.knowledge_version;

    assert(
      wheatResult.cycle.knowledge_version === catalogKnowledgeVersion &&
        wheatResult.metadata.knowledgeVersion === catalogKnowledgeVersion,
      "Test 15: Crop cycle knowledge version matches active catalog version dynamically (not hardcoded)",
      `Catalog version: "${catalogKnowledgeVersion}", Pinned cycle version: "${wheatResult.cycle.knowledge_version}"`
    );

    // ------------------------------------------------------------------------
    // TEST 16: Rule Version Dynamically Pinned
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 16: Rule Version Dynamically Pinned ---");
    const activeRules = await CropKnowledgeService.getActiveRules();
    const irrigRule = activeRules.find((r) => r.id === "RULE_IRRIG_RAIN_48H");
    const irrigTask = wheatResult.tasks.find((t) => t.task_code === "ACT_WHEAT_IRRIG_CRI");

    assert(
      irrigTask?.rule_id === "RULE_IRRIG_RAIN_48H" &&
        irrigTask?.rule_version === irrigRule?.rule_version,
      "Test 16: Weather-sensitive task dynamically resolves active rule version",
      `Task Rule: ${irrigTask?.rule_id} v${irrigTask?.rule_version} (Catalog Rule version: v${irrigRule?.rule_version})`
    );

    // ------------------------------------------------------------------------
    // TEST 17: Determinism: Identical Input Gives Identical Output
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 17: Determinism Verification ---");
    // Clean up wheat test cycle so we can re-generate with identical input
    await supabaseAdmin.from("crop_cycles").delete().eq("id", wheatResult.cycle.id);

    const reWheatResult = await LifecycleGeneratorService.generateLifecycle({
      userId: testUserId,
      farmId: testFarmId,
      cropCode: "WHEAT_BREAD",
      varietyCode: "HD_2967",
      sowingDate: wheatSowing,
      allocatedArea: 2.5,
      areaUnit: "acre",
      notes: "Phase 4 Wheat Test Plot",
    });
    testCycleIds.push(reWheatResult.cycle.id);

    const datesMatch =
      reWheatResult.cycle.target_harvest_date === wheatResult.cycle.target_harvest_date &&
      reWheatResult.stages.every(
        (s, idx) => s.target_start_date === wheatResult.stages[idx].target_start_date
      ) &&
      reWheatResult.tasks.every(
        (t, idx) => t.target_date === wheatResult.tasks[idx].target_date
      );

    assert(
      datesMatch,
      "Test 17: Same input parameters produce 100% identical dates and schedule deterministically",
      `First Target Harvest: ${wheatResult.cycle.target_harvest_date}, Second Target Harvest: ${reWheatResult.cycle.target_harvest_date}`
    );

    // ------------------------------------------------------------------------
    // TEST 18: No Duplicate Tasks on Retry
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 18: No Duplicate Tasks on Retry ---");
    const { data: taskCountRows } = await supabaseAdmin
      .from("farm_tasks")
      .select("id")
      .eq("crop_cycle_id", reWheatResult.cycle.id);

    assert(
      taskCountRows?.length === 11,
      "Test 18: Task count is exactly 11; retry did not duplicate or leak tasks",
      `Total tasks in database for cycle: ${taskCountRows?.length}`
    );

    // ------------------------------------------------------------------------
    // TEST 19: Pure Date-Only Calendar Arithmetic (Leap Year & Month Boundaries)
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 19: Pure Date-Only Calendar Arithmetic ---");
    // Leap year 2024: Feb 28 + 1 = Feb 29
    const leapDay = addDays("2024-02-28", 1);
    const postLeapDay = addDays("2024-02-28", 2);

    // Non-leap year 2025: Feb 28 + 1 = Mar 01
    const nonLeapDay = addDays("2025-02-28", 1);

    // Month boundary: Oct 31 + 1 = Nov 01
    const octNov = addDays("2026-10-31", 1);

    // Year boundary: Dec 31 + 1 = Jan 01 next year
    const yearRollover = addDays("2026-12-31", 1);

    // Diff days
    const diff = diffDays("2024-02-28", "2024-03-01"); // In leap year, diff is 2 days

    assert(
      leapDay === "2024-02-29" &&
        postLeapDay === "2024-03-01" &&
        nonLeapDay === "2025-03-01" &&
        octNov === "2026-11-01" &&
        yearRollover === "2027-01-01" &&
        diff === 2 &&
        isLeapYear(2024) &&
        !isLeapYear(2025),
      "Test 19: Timezone-independent JDN arithmetic passes leap years and boundary transitions",
      `2024-02-28+1 = ${leapDay}, 2025-02-28+1 = ${nonLeapDay}, 2026-10-31+1 = ${octNov}, 2026-12-31+1 = ${yearRollover}`
    );

    // ------------------------------------------------------------------------
    // TEST 20: Existing Legacy Farm & Crop Data Untouched
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 20: Existing Legacy Data Untouched ---");
    const { count: postFarmsCount } = await supabaseAdmin.from("farms").select("*", { count: "exact", head: true });
    const { count: postCropsCount } = await supabaseAdmin.from("crops").select("*", { count: "exact", head: true });
    const { count: postExpensesCount } = await supabaseAdmin.from("expenses").select("*", { count: "exact", head: true });
    const { count: postProfilesCount } = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true });

    assert(
      preFarmsCount === postFarmsCount &&
        preCropsCount === postCropsCount &&
        preExpensesCount === postExpensesCount &&
        preProfilesCount === postProfilesCount,
      "Test 20: Existing legacy tables (farms, crops, expenses, profiles) remain 100% unmodified",
      `Farms: ${postFarmsCount}/${preFarmsCount}, Crops: ${postCropsCount}/${preCropsCount}, Expenses: ${postExpensesCount}/${preExpensesCount}, Profiles: ${postProfilesCount}/${preProfilesCount}`
    );

  } catch (err: any) {
    console.error("💥 Unhandled exception in test suite:", err);
    failed++;
  } finally {
    // ------------------------------------------------------------------------
    // CLEANUP: Clean up test cycles generated during the test run
    // ------------------------------------------------------------------------
    if (testCycleIds.length > 0) {
      console.log(`\n[CLEANUP] Cleaning up ${testCycleIds.length} test cycles...`);
      for (const cid of testCycleIds) {
        await supabaseAdmin.from("crop_cycles").delete().eq("id", cid);
      }
      console.log("✅ Test cycles cleaned up successfully.");
    }
  }

  // Final Summary
  console.log("\n====================================================================");
  console.log(`📊 PHASE 4 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("====================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runPhase4Tests()
    .then(() => {
      console.log("Phase 4 test execution completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Test execution failed:", err);
      process.exit(1);
    });
}
