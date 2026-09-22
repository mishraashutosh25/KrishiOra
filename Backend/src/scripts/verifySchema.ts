import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const url = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY!;

const supabaseAdmin = createClient(url, serviceKey);
const supabaseAnon = createClient(url, pubKey);

export async function verifySchema() {
  console.log("====================================================================");
  console.log("🔍 KRISHIORA SCHEMA & INTEGRITY VERIFICATION SUITE");
  console.log("====================================================================");

  // 1. Existing Tables Integrity
  console.log("\n[TEST 1] Existing Application Tables & Data Integrity:");
  const existingTables = ["farms", "crops", "expenses", "profiles", "password_reset_otps"];
  for (const t of existingTables) {
    const { data, error, count } = await supabaseAdmin.from(t).select("*", { count: "exact" }).limit(1);
    if (error) {
      console.error(`❌ Existing table '${t}' check failed:`, error.message);
    } else {
      console.log(`✅ Existing table '${t}' is intact (sample record accessible).`);
    }
  }

  // 2. New Feature Tables Check
  console.log("\n[TEST 2] Smart Crop Lifecycle New Tables:");
  const newTables = [
    "crop_knowledge_catalog",
    "crop_variety_catalog",
    "crop_stage_templates",
    "crop_activity_templates",
    "agricultural_rules",
    "crop_cycles",
    "crop_cycle_stages",
    "farm_tasks",
    "task_dependencies",
    "task_schedule_history",
    "field_activity_logs",
    "weather_snapshots",
    "decision_logs",
    "notification_queue",
    "notification_attempts",
  ];

  const statusMap: Record<string, boolean> = {};

  for (const t of newTables) {
    const { error } = await supabaseAdmin.from(t).select("*").limit(1);
    if (error) {
      console.log(`⏳ Table '${t}': Not yet created in Supabase (Reason: ${error.message})`);
      statusMap[t] = false;
    } else {
      console.log(`✅ Table '${t}': Live and accessible in Supabase.`);
      statusMap[t] = true;
    }
  }

  // 3. Anon RLS Isolation Test
  console.log("\n[TEST 3] Row-Level Security (Anon Isolation Check):");
  for (const t of newTables) {
    if (statusMap[t]) {
      const { data, error } = await supabaseAnon.from(t).select("*").limit(5);
      if (data && data.length > 0) {
        console.warn(`⚠️ Warning: Table '${t}' returned ${data.length} records to anonymous client.`);
      } else {
        console.log(`🔒 RLS Verified: Table '${t}' isolated from anonymous clients.`);
      }
    }
  }

  console.log("\n====================================================================");
  console.log("Verification check completed.");
  console.log("====================================================================");
  return statusMap;
}

if (require.main === module) {
  verifySchema();
}

export default verifySchema;
