import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

/**
 * Migration Runner Script
 * 
 * Safely executes versioned SQL migrations against Supabase PostgreSQL.
 * Requires DATABASE_URL or DB connection variables in .env.
 * If DATABASE_URL is not set, prints clear instructions for running via Supabase SQL Editor.
 */
async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log("====================================================================");
    console.log("ℹ️  DATABASE_URL is not configured in .env");
    console.log("To run migrations automatically from the CLI:");
    console.log("  Add DATABASE_URL to Backend/.env in the format:");
    console.log("  DATABASE_URL=postgresql://postgres.[REF]:[DB_PASSWORD]@[POOLER_HOST]:6543/postgres");
    console.log("");
    console.log("Alternatively, run the consolidated SQL migration directly in:");
    console.log("  👉 Supabase Dashboard -> SQL Editor -> New Query");
    console.log("  File: Backend/src/migrations/00_full_schema_migration.sql");
    console.log("====================================================================");
    return;
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to PostgreSQL database...");
    await client.connect();
    console.log("✅ Connected successfully.");

    const migrationsDir = path.join(__dirname, "..", "migrations");
    const migrationFiles = [
      "01_master_knowledge_catalogs.sql",
      "02_operational_planning.sql",
      "03_reality_context_history.sql",
      "04_audit_notification.sql",
      "05_targeted_indexes.sql",
      "06_rls_policies.sql",
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Executing migration: ${file}...`);
      const sql = fs.readFileSync(filePath, "utf-8");

      await client.query("BEGIN;");
      try {
        await client.query(sql);
        await client.query("COMMIT;");
        console.log(`✅ ${file} applied successfully.`);
      } catch (err: any) {
        await client.query("ROLLBACK;");
        console.error(`❌ Migration failed at ${file}:`, err.message);
        throw err;
      }
    }

    console.log("🎉 All 6 migrations executed successfully!");
  } catch (err: any) {
    console.error("Migration execution halted:", err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

if (require.main === module) {
  runMigrations();
}

export default runMigrations;
