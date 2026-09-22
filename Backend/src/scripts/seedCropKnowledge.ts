/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 3: Idempotent Crop Knowledge & Agricultural Rules Seeder
 * ============================================================================
 * Seeds authoritative reference catalogs into Supabase Cloud:
 * 1. crop_knowledge_catalog (Wheat, Mustard, Chickpea)
 * 2. crop_variety_catalog (HD-2967, RH-749, Pusa Bold, JG-11, Pusa-362)
 * 3. crop_stage_templates (25 authoritative growth stages)
 * 4. crop_activity_templates (25 authoritative action templates)
 * 5. agricultural_rules (4 verified deterministic rules)
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import {
  ALL_CROPS_KNOWLEDGE,
  ACTIVE_AGRICULTURAL_RULES,
} from "../data/cropKnowledge";

export async function seedCropKnowledge() {
  console.log("====================================================================");
  console.log("🌱 SEEDING MASTER CROP KNOWLEDGE & AUTHORITATIVE RULES");
  console.log("====================================================================");

  // 1. Seed Agricultural Rules
  console.log("\n[1/5] Seeding Authoritative Agricultural Rules...");
  for (const rule of ACTIVE_AGRICULTURAL_RULES) {
    const { data, error } = await supabaseAdmin
      .from("agricultural_rules")
      .upsert(
        {
          id: rule.id,
          rule_version: rule.rule_version,
          rule_name: rule.rule_name,
          category: rule.category,
          source_citation: rule.source_citation,
          effective_from: rule.effective_from,
          review_status: rule.review_status,
          condition_expression: rule.condition_expression,
          action_type: rule.action_type,
          explanation_template: rule.explanation_template,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to seed rule ${rule.id}:`, error.message);
      throw error;
    }
    console.log(`  ✅ Rule seeded: [${data.id}] v${data.rule_version} - ${data.rule_name}`);
  }

  // 2. Iterate through each crop knowledge bundle
  for (const bundle of ALL_CROPS_KNOWLEDGE) {
    const cropCode = bundle.crop.crop_code;
    console.log(`\n====================================================================`);
    console.log(`🌾 Processing Crop: ${bundle.crop.common_name} (${cropCode})`);
    console.log(`====================================================================`);

    // 2.1 Seed Crop Record
    console.log(`[2/5] Upserting Crop Knowledge Record for ${cropCode}...`);
    const { data: cropData, error: cropError } = await supabaseAdmin
      .from("crop_knowledge_catalog")
      .upsert(
        {
          crop_code: bundle.crop.crop_code,
          common_name: bundle.crop.common_name,
          scientific_name: bundle.crop.scientific_name,
          season_category: bundle.crop.season_category,
          source_reference: bundle.crop.source_reference,
          knowledge_version: bundle.crop.knowledge_version,
          is_active: bundle.crop.is_active,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "crop_code" }
      )
      .select()
      .single();

    if (cropError || !cropData) {
      console.error(`❌ Failed to seed crop ${cropCode}:`, cropError?.message);
      throw cropError;
    }
    const cropId = cropData.id;
    console.log(`  ✅ Crop seeded: ID=${cropId}, Code=${cropData.crop_code}`);

    // 2.2 Seed Varieties
    console.log(`[3/5] Seeding Varieties for ${cropCode}...`);
    for (const v of bundle.varieties) {
      const { data: varData, error: varError } = await supabaseAdmin
        .from("crop_variety_catalog")
        .upsert(
          {
            crop_id: cropId,
            variety_code: v.variety_code,
            variety_name: v.variety_name,
            typical_duration_days: v.typical_duration_days,
            min_duration_days: v.min_duration_days,
            max_duration_days: v.max_duration_days,
            source_reference: v.source_reference,
            is_active: v.is_active,
          },
          { onConflict: "crop_id,variety_code" }
        )
        .select()
        .single();

      if (varError) {
        console.error(`❌ Failed to seed variety ${v.variety_code}:`, varError.message);
        throw varError;
      }
      console.log(`  ✅ Variety: [${varData.variety_code}] "${varData.variety_name}" (${varData.min_duration_days}-${varData.max_duration_days} days)`);
    }

    // 2.3 Seed Stage Templates
    console.log(`[4/5] Seeding Growth Stage Templates for ${cropCode}...`);
    const stageIdMap = new Map<string, string>();

    for (const s of bundle.stages) {
      const { data: stageData, error: stageError } = await supabaseAdmin
        .from("crop_stage_templates")
        .upsert(
          {
            crop_id: cropId,
            stage_code: s.stage_code,
            stage_name: s.stage_name,
            stage_order: s.stage_order,
            typical_start_day_offset: s.typical_start_day_offset,
            typical_end_day_offset: s.typical_end_day_offset,
            is_critical_monitoring: s.is_critical_monitoring,
            description: s.description,
          },
          { onConflict: "crop_id,stage_code" }
        )
        .select()
        .single();

      if (stageError) {
        console.error(`❌ Failed to seed stage ${s.stage_code}:`, stageError.message);
        throw stageError;
      }
      stageIdMap.set(s.stage_code, stageData.id);
      console.log(`  ✅ Stage ${stageData.stage_order}: [${stageData.stage_code}] "${stageData.stage_name}" (Days ${stageData.typical_start_day_offset}-${stageData.typical_end_day_offset})`);
    }

    // 2.4 Seed Activity Templates
    console.log(`[5/5] Seeding Action & Activity Templates for ${cropCode}...`);
    for (const a of bundle.activities) {
      const stageTemplateId = stageIdMap.get(a.stage_code);
      if (!stageTemplateId) {
        throw new Error(`Could not resolve stage_template_id for stage_code: ${a.stage_code}`);
      }

      const { data: actData, error: actError } = await supabaseAdmin
        .from("crop_activity_templates")
        .upsert(
          {
            crop_id: cropId,
            stage_template_id: stageTemplateId,
            activity_code: a.activity_code,
            activity_title: a.activity_title,
            activity_category: a.activity_category,
            earliest_day_offset: a.earliest_day_offset,
            target_day_offset: a.target_day_offset,
            latest_day_offset: a.latest_day_offset,
            priority: a.priority,
            is_weather_sensitive: a.is_weather_sensitive,
            weather_sensitivity_type: a.weather_sensitivity_type || null,
            default_rule_id: a.default_rule_id || null,
            guidance_notes: a.guidance_notes || null,
          },
          { onConflict: "crop_id,activity_code" }
        )
        .select()
        .single();

      if (actError) {
        console.error(`❌ Failed to seed activity ${a.activity_code}:`, actError.message);
        throw actError;
      }
      console.log(`  ✅ Activity: [${actData.activity_code}] "${actData.activity_title}" (Window: [${actData.earliest_day_offset}, ${actData.target_day_offset}, ${actData.latest_day_offset}], Priority: ${actData.priority})`);
    }
  }

  console.log("\n====================================================================");
  console.log("🎉 MASTER CROP KNOWLEDGE & RULES SEEDING COMPLETE");
  console.log("====================================================================");
}

// Run directly if invoked from CLI
if (require.main === module) {
  seedCropKnowledge()
    .then(() => {
      console.log("Seeding script executed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding script failed with error:", err);
      process.exit(1);
    });
}
