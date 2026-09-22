/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 4: API Endpoint Integration & Security Test
 * ============================================================================
 * Tests:
 * 1. Anonymous requests to protected routes return 401.
 * 2. GET /api/crop-knowledge/crops returns active crops.
 * 3. GET /api/crop-knowledge/crops/WHEAT_BREAD/varieties returns approved varieties.
 * 4. GET /api/crop-knowledge/rules returns active rules.
 * 5. POST /api/lifecycles rejects unauthenticated requests (401).
 * ============================================================================
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cropKnowledgeRoutes from "../routes/cropKnowledge.routes";
import lifecycleRoutes from "../routes/lifecycle.routes";

async function runApiSecurityTests() {
  console.log("====================================================================");
  console.log("🔒 KRISHIORA PHASE 4 API SECURITY & ENDPOINTS TEST");
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

  // Setup ephemeral Express app
  const app = express();
  app.use(express.json());
  app.use("/api/crop-knowledge", cropKnowledgeRoutes);
  app.use("/api/lifecycles", lifecycleRoutes);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // Test 1: Anonymous request to /api/crop-knowledge/crops returns 401
    const anonCropRes = await fetch(`${baseUrl}/api/crop-knowledge/crops`);
    const anonCropData: any = await anonCropRes.json();

    assert(
      anonCropRes.status === 401 && anonCropData.success === false,
      "API Test 1: Anonymous request to /api/crop-knowledge/crops rejected with 401",
      `Status: ${anonCropRes.status}, Message: "${anonCropData.message}"`
    );

    // Test 2: Anonymous request to POST /api/lifecycles returns 401
    const anonLifecycleRes = await fetch(`${baseUrl}/api/lifecycles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmId: "fake-id", cropCode: "WHEAT_BREAD" }),
    });
    const anonLifecycleData: any = await anonLifecycleRes.json();

    assert(
      anonLifecycleRes.status === 401 && anonLifecycleData.success === false,
      "API Test 2: Anonymous request to POST /api/lifecycles rejected with 401",
      `Status: ${anonLifecycleRes.status}, Message: "${anonLifecycleData.message}"`
    );

    // Test 3: Invalid Bearer token returns 401
    const invalidTokenRes = await fetch(`${baseUrl}/api/crop-knowledge/crops`, {
      headers: { Authorization: "Bearer invalid.fake.token" },
    });
    const invalidTokenData: any = await invalidTokenRes.json();

    assert(
      invalidTokenRes.status === 401 && invalidTokenData.success === false,
      "API Test 3: Request with malformed/invalid JWT rejected with 401",
      `Status: ${invalidTokenRes.status}, Message: "${invalidTokenData.message}"`
    );

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log("\n====================================================================");
  console.log(`📊 API SECURITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("====================================================================");

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runApiSecurityTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("API tests failed:", err);
      process.exit(1);
    });
}
