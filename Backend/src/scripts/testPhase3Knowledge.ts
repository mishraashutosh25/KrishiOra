/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 3: Crop Knowledge Catalog & Rule Versioning Verification Suite
 * ============================================================================
 * Verifies all 12 test requirements specified in Phase 3 prompt:
 *   1. Valid crop retrieval
 *   2. Invalid crop rejection
 *   3. Variety belongs to crop
 *   4. Invalid crop/variety relationship rejected
 *   5. Stage ordering validation
 *   6. Invalid activity window rejected
 *   7. Invalid duration range rejected
 *   8. Inactive knowledge excluded
 *   9. Rule version retrieval
 *   10. Source citation required
 *   11. Duplicate knowledge prevention
 *   12. Historical rule version remains retrievable
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import { CropKnowledgeService } from "../services/cropKnowledge.service";
import { CompleteCropKnowledge } from "../types/cropKnowledge.types";
import {
  WHEAT_KNOWLEDGE,
  MUSTARD_KNOWLEDGE,
  CHICKPEA_KNOWLEDGE,
} from "../data/cropKnowledge";

async function runPhase3Tests() {
  console.log("====================================================================");
  console.log("🧪 KRISHIORA PHASE 3 KNOWLEDGE & RULE VERSIONING TEST SUITE");
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

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Valid Crop Retrieval
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 1: Valid Crop Retrieval ---");
    const wheat = await CropKnowledgeService.getCropByCode("WHEAT_BREAD");
    const mustard = await CropKnowledgeService.getCropByCode("MUSTARD_INDIAN");
    const chickpea = await CropKnowledgeService.getCropByCode("CHICKPEA_DESI");

    assert(
      wheat !== null && wheat.crop_code === "WHEAT_BREAD" && wheat.season_category === "Rabi",
      "Test 1.1: Wheat retrieved successfully",
      `Retrieved: ${wheat?.common_name} (${wheat?.scientific_name}), Season: ${wheat?.season_category}`
    );
    assert(
      mustard !== null && mustard.crop_code === "MUSTARD_INDIAN",
      "Test 1.2: Mustard retrieved successfully",
      `Retrieved: ${mustard?.common_name} (${mustard?.scientific_name})`
    );
    assert(
      chickpea !== null && chickpea.crop_code === "CHICKPEA_DESI",
      "Test 1.3: Chickpea retrieved successfully",
      `Retrieved: ${chickpea?.common_name} (${chickpea?.scientific_name})`
    );

    // ------------------------------------------------------------------------
    // TEST 2: Invalid Crop Rejection
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 2: Invalid Crop Rejection ---");
    const nonExistent = await CropKnowledgeService.getCropByCode("NON_EXISTENT_CROP");
    assert(
      nonExistent === null,
      "Test 2: Non-existent crop code returns null (rejected safely)",
      "Queried 'NON_EXISTENT_CROP' and received null as expected"
    );

    // ------------------------------------------------------------------------
    // TEST 3: Variety Belongs to Crop
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 3: Variety Belongs to Crop ---");
    const wheatVarieties = await CropKnowledgeService.getVarietiesByCrop("WHEAT_BREAD");
    const mustardVarieties = await CropKnowledgeService.getVarietiesByCrop("MUSTARD_INDIAN");
    const chickpeaVarieties = await CropKnowledgeService.getVarietiesByCrop("CHICKPEA_DESI");

    const hasHd2967 = wheatVarieties.some((v) => v.variety_code === "HD_2967");
    const hasRh749 = mustardVarieties.some((v) => v.variety_code === "RH_749");
    const hasPusaBold = mustardVarieties.some((v) => v.variety_code === "PUSA_BOLD");
    const hasJg11 = chickpeaVarieties.some((v) => v.variety_code === "JG_11");
    const hasPusa362 = chickpeaVarieties.some((v) => v.variety_code === "PUSA_362");

    assert(
      hasHd2967,
      "Test 3.1: Wheat variety HD-2967 correctly associated with WHEAT_BREAD",
      `Varieties found for Wheat: ${wheatVarieties.map((v) => v.variety_code).join(", ")}`
    );
    assert(
      hasRh749 && hasPusaBold,
      "Test 3.2: Mustard varieties (RH-749, Pusa Bold) correctly associated with MUSTARD_INDIAN",
      `Varieties found for Mustard: ${mustardVarieties.map((v) => v.variety_code).join(", ")}`
    );
    assert(
      hasJg11 && hasPusa362,
      "Test 3.3: Chickpea varieties (JG-11, Pusa-362) correctly associated with CHICKPEA_DESI",
      `Varieties found for Chickpea: ${chickpeaVarieties.map((v) => v.variety_code).join(", ")}`
    );

    // ------------------------------------------------------------------------
    // TEST 4: Invalid Crop / Variety Relationship Rejected
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 4: Invalid Crop / Variety Relationship Rejected ---");
    // HD_2967 should never be returned under MUSTARD_INDIAN
    const hd2967InMustard = mustardVarieties.some((v) => v.variety_code === "HD_2967");
    assert(
      !hd2967InMustard,
      "Test 4.1: Cross-crop variety isolation verified (HD-2967 not in Mustard)",
      "Wheat variety HD-2967 is properly quarantined from Mustard"
    );

    // Attempt to insert invalid variety referencing non-existent crop UUID
    const { error: fkError } = await supabaseAdmin.from("crop_variety_catalog").insert({
      crop_id: "00000000-0000-0000-0000-000000000000",
      variety_code: "FAKE_VARIETY",
      variety_name: "Fake Variety",
      typical_duration_days: 120,
      min_duration_days: 110,
      max_duration_days: 130,
      source_reference: "Invalid reference test",
    });

    assert(
      fkError !== null,
      "Test 4.2: Database foreign key rejects variety with invalid crop_id",
      `Database error code: ${fkError?.code} - ${fkError?.message}`
    );

    // ------------------------------------------------------------------------
    // TEST 5: Stage Ordering Validation
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 5: Stage Ordering Validation ---");
    const wheatStages = await CropKnowledgeService.getStagesByCrop("WHEAT_BREAD");
    let isMonotonic = true;
    for (let i = 0; i < wheatStages.length; i++) {
      if (wheatStages[i].stage_order !== i + 1) {
        isMonotonic = false;
        break;
      }
    }
    assert(
      wheatStages.length === 9 && isMonotonic,
      "Test 5.1: Wheat has 9 stages in strictly monotonic sequential order (1 to 9)",
      `Stages: ${wheatStages.map((s) => `${s.stage_order}:${s.stage_code}`).join(" -> ")}`
    );

    // Test validation engine rejection on broken order
    const brokenKnowledge: CompleteCropKnowledge = {
      ...WHEAT_KNOWLEDGE,
      stages: [
        { ...WHEAT_KNOWLEDGE.stages[0], stage_order: 1 },
        { ...WHEAT_KNOWLEDGE.stages[1], stage_order: 3 }, // Gap: jumped from 1 to 3
      ],
    };
    const orderValidation = CropKnowledgeService.validateCropKnowledge(brokenKnowledge);
    assert(
      !orderValidation.isValid && orderValidation.errors.some((e) => e.includes("non-monotonic")),
      "Test 5.2: Validation engine rejects stage ordering sequence gaps",
      `Validation error caught: "${orderValidation.errors.find((e) => e.includes("non-monotonic"))}"`
    );

    // ------------------------------------------------------------------------
    // TEST 6: Invalid Activity Window Rejected
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 6: Invalid Activity Window Rejected ---");
    // Earliest > Target
    const invalidWindowKnowledge: CompleteCropKnowledge = {
      ...WHEAT_KNOWLEDGE,
      activities: [
        {
          ...WHEAT_KNOWLEDGE.activities[0],
          earliest_day_offset: 25,
          target_day_offset: 20, // Violation: 25 > 20
          latest_day_offset: 30,
        },
      ],
    };
    const windowValidation = CropKnowledgeService.validateCropKnowledge(invalidWindowKnowledge);
    assert(
      !windowValidation.isValid && windowValidation.errors.some((e) => e.includes("window constraint")),
      "Test 6.1: Validation engine rejects earliest > target window violation",
      `Validation error caught: "${windowValidation.errors.find((e) => e.includes("window constraint"))}"`
    );

    // Test DB CHECK constraint chk_activity_offsets
    if (wheat?.id) {
      const { error: actDbError } = await supabaseAdmin.from("crop_activity_templates").insert({
        crop_id: wheat.id,
        stage_template_id: wheatStages[0].id,
        activity_code: "ACT_INVALID_WINDOW_TEST",
        activity_title: "Invalid Window Test",
        activity_category: "IRRIGATION",
        earliest_day_offset: 50,
        target_day_offset: 40, // 50 > 40 violates CHECK
        latest_day_offset: 60,
      });
      assert(
        actDbError !== null,
        "Test 6.2: Database CHECK constraint rejects invalid activity offsets (earliest > target)",
        `Database rejected with: ${actDbError?.message}`
      );
    }

    // ------------------------------------------------------------------------
    // TEST 7: Invalid Duration Range Rejected
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 7: Invalid Duration Range Rejected ---");
    // Min > Typical
    const invalidDurationKnowledge: CompleteCropKnowledge = {
      ...WHEAT_KNOWLEDGE,
      varieties: [
        {
          ...WHEAT_KNOWLEDGE.varieties[0],
          min_duration_days: 150,
          typical_duration_days: 140, // Violation: 150 > 140
          max_duration_days: 160,
        },
      ],
    };
    const durationValidation = CropKnowledgeService.validateCropKnowledge(invalidDurationKnowledge);
    assert(
      !durationValidation.isValid && durationValidation.errors.some((e) => e.includes("duration constraint")),
      "Test 7.1: Validation engine rejects min_duration > typical_duration",
      `Validation error caught: "${durationValidation.errors.find((e) => e.includes("duration constraint"))}"`
    );

    // Test DB CHECK constraint chk_variety_duration
    if (wheat?.id) {
      const { error: varDbError } = await supabaseAdmin.from("crop_variety_catalog").insert({
        crop_id: wheat.id,
        variety_code: "VAR_INVALID_DUR_TEST",
        variety_name: "Invalid Duration Test",
        typical_duration_days: 100,
        min_duration_days: 120, // 120 > 100 violates CHECK
        max_duration_days: 140,
        source_reference: "Test ref",
      });
      assert(
        varDbError !== null,
        "Test 7.2: Database CHECK constraint rejects variety duration where min > typical",
        `Database rejected with: ${varDbError?.message}`
      );
    }

    // ------------------------------------------------------------------------
    // TEST 8: Inactive Knowledge Excluded
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 8: Inactive Knowledge Excluded ---");
    // 1. Check getActiveCrops only returns is_active = true
    const activeCrops = await CropKnowledgeService.getActiveCrops();
    const allActive = activeCrops.every((c) => c.is_active === true);
    assert(
      activeCrops.length >= 3 && allActive,
      "Test 8.1: getActiveCrops() strictly filters out inactive crops",
      `Active crops retrieved: ${activeCrops.map((c) => c.crop_code).join(", ")}`
    );

    // 2. Temporarily set an inactive test crop in DB, verify getCropByCode rejects it
    const { data: inactiveCrop } = await supabaseAdmin
      .from("crop_knowledge_catalog")
      .insert({
        crop_code: "TEST_INACTIVE_BARLEY",
        common_name: "Test Inactive Barley",
        season_category: "Rabi",
        source_reference: "ICAR-IIWBR Test",
        is_active: false, // INACTIVE!
      })
      .select()
      .single();

    const retrievedInactive = await CropKnowledgeService.getCropByCode("TEST_INACTIVE_BARLEY");
    assert(
      retrievedInactive === null,
      "Test 8.2: getCropByCode() rejects inactive crop (returns null)",
      "Inactive crop 'TEST_INACTIVE_BARLEY' successfully excluded from operational retrieval"
    );

    // Clean up temporary test row
    if (inactiveCrop?.id) {
      await supabaseAdmin.from("crop_knowledge_catalog").delete().eq("id", inactiveCrop.id);
    }

    // ------------------------------------------------------------------------
    // TEST 9: Rule Version Retrieval
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 9: Rule Version Retrieval ---");
    const irrigRule = await CropKnowledgeService.getRuleByIdAndVersion("RULE_IRRIG_RAIN_48H", "1.0");
    const sprayRule = await CropKnowledgeService.getRuleByIdAndVersion("RULE_SPRAY_WIND_15KMH", "1.0");
    const harvestRule = await CropKnowledgeService.getRuleByIdAndVersion("RULE_HARVEST_RAIN_72H", "1.0");
    const heatRule = await CropKnowledgeService.getRuleByIdAndVersion("RULE_HIGH_TEMP_CRI_WHEAT", "1.0");

    assert(
      irrigRule !== null && irrigRule.rule_version === "1.0" && irrigRule.action_type === "RESCHEDULE_TASK",
      "Test 9.1: RULE_IRRIG_RAIN_48H v1.0 retrieved with exact action RESCHEDULE_TASK",
      `Source: ${irrigRule?.source_citation}`
    );
    assert(
      sprayRule !== null && sprayRule.rule_version === "1.0" && sprayRule.action_type === "HOLD_FOR_INSPECTION",
      "Test 9.2: RULE_SPRAY_WIND_15KMH v1.0 retrieved with exact action HOLD_FOR_INSPECTION",
      `Source: ${sprayRule?.source_citation}`
    );
    assert(
      harvestRule !== null && harvestRule.action_type === "EMIT_WARNING",
      "Test 9.3: RULE_HARVEST_RAIN_72H v1.0 retrieved with exact action EMIT_WARNING",
      `Template: "${harvestRule?.explanation_template.substring(0, 60)}..."`
    );
    assert(
      heatRule !== null && heatRule.action_type === "EMIT_WARNING",
      "Test 9.4: RULE_HIGH_TEMP_CRI_WHEAT v1.0 retrieved with exact action EMIT_WARNING",
      `Condition: ${JSON.stringify(heatRule?.condition_expression)}`
    );

    // ------------------------------------------------------------------------
    // TEST 10: Source Citation Required
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 10: Source Citation Required ---");
    // Test rule without citation
    const unsourcedRule = CropKnowledgeService.validateAgriculturalRule({
      id: "RULE_UNSOURCED",
      rule_version: "1.0",
      rule_name: "Unsourced Rule Test",
      category: "IRRIGATION",
      source_citation: "", // EMPTY CITATION
      effective_from: "2026-01-01",
      review_status: "EXPERIMENTAL",
      condition_expression: { test: true },
      action_type: "EMIT_WARNING",
      explanation_template: "Test template",
    });

    assert(
      !unsourcedRule.isValid && unsourcedRule.errors.some((e) => e.includes("authoritative source citation")),
      "Test 10.1: Agricultural rule missing source citation is strictly rejected",
      `Validation error: "${unsourcedRule.errors[0]}"`
    );

    // Test crop without citation
    const unsourcedCropKnowledge: CompleteCropKnowledge = {
      ...WHEAT_KNOWLEDGE,
      crop: {
        ...WHEAT_KNOWLEDGE.crop,
        source_reference: "", // EMPTY CITATION
      },
    };
    const cropCitationValidation = CropKnowledgeService.validateCropKnowledge(unsourcedCropKnowledge);
    assert(
      !cropCitationValidation.isValid && cropCitationValidation.errors.some((e) => e.includes("source citation")),
      "Test 10.2: Crop record missing source citation is strictly rejected",
      `Validation error: "${cropCitationValidation.errors[0]}"`
    );

    // ------------------------------------------------------------------------
    // TEST 11: Duplicate Knowledge Prevention
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 11: Duplicate Knowledge Prevention ---");
    // Attempt duplicate crop_code insertion
    const { error: dupCropError } = await supabaseAdmin.from("crop_knowledge_catalog").insert({
      crop_code: "WHEAT_BREAD", // DUPLICATE!
      common_name: "Duplicate Bread Wheat",
      season_category: "Rabi",
      source_reference: "Duplicate test citation",
    });

    assert(
      dupCropError !== null && dupCropError.code === "23505",
      "Test 11.1: Database unique constraint prevents duplicate crop_code (Postgres error 23505)",
      `Database response: ${dupCropError?.message}`
    );

    // Attempt duplicate (crop_id, variety_code)
    if (wheat?.id) {
      const { error: dupVarietyError } = await supabaseAdmin.from("crop_variety_catalog").insert({
        crop_id: wheat.id,
        variety_code: "HD_2967", // DUPLICATE!
        variety_name: "Duplicate HD 2967",
        typical_duration_days: 140,
        min_duration_days: 130,
        max_duration_days: 148,
        source_reference: "Duplicate test",
      });

      assert(
        dupVarietyError !== null && dupVarietyError.code === "23505",
        "Test 11.2: Database unique constraint prevents duplicate (crop_id, variety_code)",
        `Database response: ${dupVarietyError?.message}`
      );
    }

    // ------------------------------------------------------------------------
    // TEST 12: Historical Rule Version Remains Retrievable
    // ------------------------------------------------------------------------
    console.log("\n--- TEST 12: Historical Rule Version Remains Retrievable ---");
    // Retrieve historical version "0.9-PILOT" of RULE_IRRIG_RAIN_48H
    const historicalRule = await CropKnowledgeService.getRuleByIdAndVersion(
      "RULE_IRRIG_RAIN_48H",
      "0.9-PILOT"
    );

    const currentRule = await CropKnowledgeService.getRuleByIdAndVersion(
      "RULE_IRRIG_RAIN_48H",
      "1.0"
    );

    assert(
      historicalRule !== null &&
        historicalRule.rule_version === "0.9-PILOT" &&
        historicalRule.review_status === "DEPRECATED",
      "Test 12.1: Historical rule version 0.9-PILOT successfully retrieved with original parameters",
      `Version: ${historicalRule?.rule_version}, Status: ${historicalRule?.review_status}, Threshold: ${(historicalRule?.condition_expression as Record<string, unknown>)?.rainfall_threshold_mm}mm`
    );

    assert(
      currentRule !== null &&
        currentRule.rule_version === "1.0" &&
        currentRule.review_status === "VERIFIED",
      "Test 12.2: Active rule version 1.0 remains intact and active simultaneously",
      `Active Version: ${currentRule?.rule_version}, Status: ${currentRule?.review_status}, Threshold: ${(currentRule?.condition_expression as Record<string, unknown>)?.rainfall_threshold_mm}mm`
    );

    const activeRulesList = await CropKnowledgeService.getActiveRules();
    const hasDeprecatedInActive = activeRulesList.some((r) => r.review_status === "DEPRECATED");

    assert(
      !hasDeprecatedInActive,
      "Test 12.3: Active rules list strictly excludes historical/deprecated versions",
      `Active verified rules count: ${activeRulesList.length}`
    );

  } catch (err: unknown) {
    console.error("💥 Unhandled exception in test suite:", err);
    failed++;
  }

  // Final Summary
  console.log("\n====================================================================");
  console.log(`📊 PHASE 3 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("====================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runPhase3Tests()
    .then(() => {
      console.log("Phase 3 test suite completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Test suite execution failed:", err);
      process.exit(1);
    });
}
