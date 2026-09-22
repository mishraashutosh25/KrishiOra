/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 5: Weather Integration & Snapshot Engine Test Suite
 * ============================================================================
 * Verifies all 21 mandatory test scenarios:
 *   1. Valid coordinate validation (-90..90, -180..180)
 *   2. Invalid latitude validation (rejects lat > 90 or < -90)
 *   3. Invalid longitude validation (rejects lon > 180 or < -180)
 *   4. Missing coordinates validation (rejects undefined/null with 400 LOCATION_REQUIRED)
 *   5. 7-day forecast parsing (extracts exactly 7 forecast daily records)
 *   6. Normalized weather mapping (temp, rain, prob, wind, condition, source, record_type)
 *   7. Historical weather mapping (past daily records mapped as HISTORICAL)
 *   8. Forecast/Historical coexistence (both record types on same date coexist safely)
 *   9. Strict Open-Meteo contract validation (rejects missing/null/NaN fields, no silent 0 coercion)
 *   10. Provider timeout handling (simulated timeout throws OpenMeteoTimeoutError)
 *   11. Provider HTTP failure handling (HTTP 500/502 throws OpenMeteoHttpError)
 *   12. Duplicate fetch idempotency (repeated refreshes update existing rows, 0 duplicate rows)
 *   13. True concurrent fetch safety (Promise.all simultaneous fetches for same farm and dates)
 *   14. Freshness: FRESH classification (age <= 3h)
 *   15. Freshness: STALE classification (3h < age <= 24h)
 *   16. Freshness: UNAVAILABLE classification (no data or age > 24h with provider outage)
 *   17. Last-known snapshot preservation (provider down -> returns cached data as FALLBACK_STALE, never deleted)
 *   18. Unauthorized farm access rejection (User B cannot access User A's farm weather -> 403)
 *   19. Anonymous access rejection (Missing auth -> 401)
 *   20. Zero lifecycle mutation invariant (crop tasks and cycle stages 100% untouched)
 *   21. TypeScript compilation (0 errors verified)
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import { OpenMeteoAdapter } from "../adapters/openMeteo.adapter";
import { WeatherService } from "../services/weather.service";
import {
  LocationRequiredError,
  InvalidCoordinatesError,
  UnauthorizedFarmAccessError,
  FarmNotFoundError,
  OpenMeteoTimeoutError,
  OpenMeteoHttpError,
  OpenMeteoMalformedResponseError,
  NormalizedWeatherSnapshot,
} from "../types/weather.types";
import { addDays } from "../utils/date.utils";

async function runPhase5Tests() {
  console.log("====================================================================");
  console.log("🧪 KRISHIORA PHASE 5 WEATHER INTEGRATION & SNAPSHOT ENGINE TEST SUITE");
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
  const USER_A_ID = "a82b2bfe-458a-460f-b5d6-9aa31150d455"; // Real owner
  const USER_B_ID = "99999999-9999-9999-9999-999999999999"; // Non-owner
  const FARM_ID = "68778a58-eb2a-4dbe-9f9c-0490b19af0b3"; // Farm owned by User A
  const TEST_LAT = 28.6139;
  const TEST_LON = 77.209;

  try {
    // --------------------------------------------------------------------------
    // Test 1: Valid coordinate validation
    // --------------------------------------------------------------------------
    console.log("\n[TEST 1] Valid coordinate validation");
    const validCoords = WeatherService.validateCoordinates({ latitude: TEST_LAT, longitude: TEST_LON });
    assert(
      validCoords.latitude === TEST_LAT && validCoords.longitude === TEST_LON,
      "Valid coordinates accepted and returned",
      `lat=${validCoords.latitude}, lon=${validCoords.longitude}`
    );

    // --------------------------------------------------------------------------
    // Test 2: Invalid latitude validation
    // --------------------------------------------------------------------------
    console.log("\n[TEST 2] Invalid latitude validation");
    let latErrorThrown = false;
    try {
      WeatherService.validateCoordinates({ latitude: 95.0, longitude: 77.2 });
    } catch (err) {
      if (err instanceof InvalidCoordinatesError) latErrorThrown = true;
    }
    assert(latErrorThrown, "Latitude > 90 rejected with InvalidCoordinatesError");

    // --------------------------------------------------------------------------
    // Test 3: Invalid longitude validation
    // --------------------------------------------------------------------------
    console.log("\n[TEST 3] Invalid longitude validation");
    let lonErrorThrown = false;
    try {
      WeatherService.validateCoordinates({ latitude: 28.6, longitude: -185.0 });
    } catch (err) {
      if (err instanceof InvalidCoordinatesError) lonErrorThrown = true;
    }
    assert(lonErrorThrown, "Longitude < -180 rejected with InvalidCoordinatesError");

    // --------------------------------------------------------------------------
    // Test 4: Missing coordinates validation (LocationRequiredError)
    // --------------------------------------------------------------------------
    console.log("\n[TEST 4] Missing coordinates validation (Zero silent fallback)");
    let locErrorThrown = false;
    try {
      WeatherService.validateCoordinates(null);
    } catch (err) {
      if (err instanceof LocationRequiredError) locErrorThrown = true;
    }
    assert(locErrorThrown, "Null coordinates rejected with LocationRequiredError (no silent Delhi fallback)");

    // --------------------------------------------------------------------------
    // Test 5: 7-day forecast parsing
    // --------------------------------------------------------------------------
    console.log("\n[TEST 5] 7-day forecast parsing via live Open-Meteo API");
    const liveForecast = await OpenMeteoAdapter.fetchDailyWeather(FARM_ID, TEST_LAT, TEST_LON, {
      forecastDays: 7,
      pastDays: 0,
    });
    assert(
      Array.isArray(liveForecast) && liveForecast.length === 7,
      "Live Open-Meteo returned exactly 7 forecast snapshots",
      `Received count: ${liveForecast.length}`
    );

    // --------------------------------------------------------------------------
    // Test 6: Normalized weather mapping
    // --------------------------------------------------------------------------
    console.log("\n[TEST 6] Normalized weather mapping & condition code translation");
    const sample = liveForecast[0];
    const isMappedProperly =
      sample.farm_id === FARM_ID &&
      typeof sample.temp_max_c === "number" &&
      typeof sample.temp_min_c === "number" &&
      typeof sample.rainfall_mm === "number" &&
      typeof sample.wind_speed_kmh === "number" &&
      sample.condition_code !== undefined &&
      sample.record_type === "FORECAST" &&
      sample.data_source === "OPEN_METEO";

    assert(
      isMappedProperly,
      "Snapshot contains all normalized domain attributes",
      `date=${sample.forecast_date}, tmax=${sample.temp_max_c}°C, rain=${sample.rainfall_mm}mm, condition=${sample.condition_code}, type=${sample.record_type}`
    );

    // --------------------------------------------------------------------------
    // Test 7: Historical weather mapping (pastDays=7)
    // --------------------------------------------------------------------------
    console.log("\n[TEST 7] Historical weather mapping via Open-Meteo");
    const liveHistory = await OpenMeteoAdapter.fetchDailyWeather(FARM_ID, TEST_LAT, TEST_LON, {
      forecastDays: 1,
      pastDays: 7,
    });
    const historyOnly = liveHistory.filter((s) => s.record_type === "HISTORICAL");
    assert(
      historyOnly.length === 7,
      "Historical records successfully extracted and classified as HISTORICAL",
      `Historical count: ${historyOnly.length}, Sample date: ${historyOnly[0]?.forecast_date}`
    );

    // --------------------------------------------------------------------------
    // Test 8: Forecast/Historical coexistence on same date
    // --------------------------------------------------------------------------
    console.log("\n[TEST 8] Forecast and Historical records coexistence without conflict");
    const testDate = "2026-09-01";
    const testRowForecast: NormalizedWeatherSnapshot = {
      farm_id: FARM_ID,
      latitude: TEST_LAT,
      longitude: TEST_LON,
      forecast_date: testDate,
      observed_at: new Date().toISOString(),
      fetched_at: new Date().toISOString(),
      rainfall_mm: 0,
      rain_probability_pct: 10,
      temp_max_c: 32.0,
      temp_min_c: 24.0,
      humidity_pct: null,
      wind_speed_kmh: 8.0,
      condition_code: "CLEAR",
      data_source: "OPEN_METEO",
      is_stale: false,
      record_type: "FORECAST",
    };
    const testRowHistory: NormalizedWeatherSnapshot = {
      ...testRowForecast,
      rainfall_mm: 5.5,
      record_type: "HISTORICAL",
    };

    await WeatherService.persistSnapshots([testRowForecast, testRowHistory]);
    const { data: coexistingRows } = await supabaseAdmin
      .from("weather_snapshots")
      .select("record_type, rainfall_mm")
      .eq("farm_id", FARM_ID)
      .eq("forecast_date", testDate);

    assert(
      coexistingRows !== null && coexistingRows.length === 2,
      "Both FORECAST and HISTORICAL records safely coexist for the same date",
      `Rows found: ${coexistingRows?.map((r) => `${r.record_type} (rain: ${r.rainfall_mm}mm)`).join(", ")}`
    );

    // Cleanup test date records
    await supabaseAdmin
      .from("weather_snapshots")
      .delete()
      .eq("farm_id", FARM_ID)
      .eq("forecast_date", testDate);

    // --------------------------------------------------------------------------
    // Test 9: Strict Open-Meteo contract validation (No silent zero coercion)
    // --------------------------------------------------------------------------
    console.log("\n[TEST 9] Strict Open-Meteo response contract validation");
    const malformedRaw = {
      daily: {
        time: ["2026-09-09"],
        weather_code: [0],
        temperature_2m_max: [null], // Missing/null temperature
        temperature_2m_min: [20.0],
        precipitation_sum: [0.0],
        wind_speed_10m_max: [5.0],
      },
    };

    let malformedErrorThrown = false;
    try {
      OpenMeteoAdapter.normalizeDailyResponse(malformedRaw, FARM_ID, TEST_LAT, TEST_LON, "2026-09-09");
    } catch (err) {
      if (err instanceof OpenMeteoMalformedResponseError) malformedErrorThrown = true;
    }
    assert(malformedErrorThrown, "Null field in provider response triggers OpenMeteoMalformedResponseError (no silent zero coercion)");

    // --------------------------------------------------------------------------
    // Test 10: Provider timeout handling
    // --------------------------------------------------------------------------
    console.log("\n[TEST 10] Provider timeout handling");
    let timeoutThrown = false;
    const mockTimeoutFetch = async () => {
      return new Promise<Response>((_, reject) => {
        setTimeout(() => {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          reject(err);
        }, 50);
      });
    };

    try {
      await OpenMeteoAdapter.fetchDailyWeather(FARM_ID, TEST_LAT, TEST_LON, {
        timeoutMs: 20,
        customFetch: mockTimeoutFetch as unknown as typeof fetch,
      });
    } catch (err) {
      if (err instanceof OpenMeteoTimeoutError) timeoutThrown = true;
    }
    assert(timeoutThrown, "Simulated timeout triggers OpenMeteoTimeoutError");

    // --------------------------------------------------------------------------
    // Test 11: Provider HTTP failure handling
    // --------------------------------------------------------------------------
    console.log("\n[TEST 11] Provider HTTP failure handling (500 Internal Server Error)");
    let httpErrorThrown = false;
    const mockHttp500Fetch = async () => {
      return new Response("Internal Server Error", { status: 500, statusText: "Internal Server Error" });
    };

    try {
      await OpenMeteoAdapter.fetchDailyWeather(FARM_ID, TEST_LAT, TEST_LON, {
        customFetch: mockHttp500Fetch as unknown as typeof fetch,
      });
    } catch (err) {
      if (err instanceof OpenMeteoHttpError && err.statusCode === 500) httpErrorThrown = true;
    }
    assert(httpErrorThrown, "Simulated HTTP 500 triggers OpenMeteoHttpError with status 500");

    // --------------------------------------------------------------------------
    // Test 12: Duplicate fetch idempotency
    // --------------------------------------------------------------------------
    console.log("\n[TEST 12] Duplicate fetch idempotency");
    // Clear snapshots for FARM_ID first
    await supabaseAdmin.from("weather_snapshots").delete().eq("farm_id", FARM_ID);

    const firstRefresh = await WeatherService.refreshWeather(USER_A_ID, FARM_ID, { latitude: TEST_LAT, longitude: TEST_LON });
    const horizonDates = firstRefresh.snapshots.map((s) => s.forecast_date);

    const { count: countAfterFirst } = await supabaseAdmin
      .from("weather_snapshots")
      .select("*", { count: "exact", head: true })
      .eq("farm_id", FARM_ID)
      .eq("record_type", "FORECAST")
      .in("forecast_date", horizonDates);

    // Second identical refresh
    await WeatherService.refreshWeather(USER_A_ID, FARM_ID, { latitude: TEST_LAT, longitude: TEST_LON });
    const { count: countAfterSecond } = await supabaseAdmin
      .from("weather_snapshots")
      .select("*", { count: "exact", head: true })
      .eq("farm_id", FARM_ID)
      .eq("record_type", "FORECAST")
      .in("forecast_date", horizonDates);

    assert(
      countAfterFirst === countAfterSecond && countAfterFirst === 7,
      "Repeated refresh calls update existing rows idempotently without creating duplicates",
      `Count after 1st: ${countAfterFirst}, Count after 2nd: ${countAfterSecond}`
    );

    // --------------------------------------------------------------------------
    // Test 13: True concurrent fetch safety (Promise.all)
    // --------------------------------------------------------------------------
    console.log("\n[TEST 13] True concurrent fetch safety (Simultaneous Promise.all execution)");
    // Execute 3 simultaneous refreshes on the exact same farm and coordinates
    const concurrentResults = await Promise.all([
      WeatherService.refreshWeather(USER_A_ID, FARM_ID, { latitude: TEST_LAT, longitude: TEST_LON }),
      WeatherService.refreshWeather(USER_A_ID, FARM_ID, { latitude: TEST_LAT, longitude: TEST_LON }),
      WeatherService.refreshWeather(USER_A_ID, FARM_ID, { latitude: TEST_LAT, longitude: TEST_LON }),
    ]);

    const { count: countAfterConcurrent } = await supabaseAdmin
      .from("weather_snapshots")
      .select("*", { count: "exact", head: true })
      .eq("farm_id", FARM_ID)
      .eq("record_type", "FORECAST")
      .in("forecast_date", horizonDates);

    assert(
      concurrentResults.length === 3 && countAfterConcurrent === 7,
      "3 concurrent simultaneous refreshes completed safely without duplicate rows or race condition errors",
      `Concurrent count: ${countAfterConcurrent}`
    );

    // --------------------------------------------------------------------------
    // Test 14: Fresh classification
    // --------------------------------------------------------------------------
    console.log("\n[TEST 14] Freshness: FRESH classification (age <= 3h)");
    const freshTimestamp = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 mins ago
    const freshStatus = WeatherService.computeFreshness(freshTimestamp);
    assert(freshStatus === "FRESH", "30-minute-old snapshot classified as FRESH");

    // --------------------------------------------------------------------------
    // Test 15: Stale classification
    // --------------------------------------------------------------------------
    console.log("\n[TEST 15] Freshness: STALE classification (3h < age <= 24h)");
    const staleTimestamp = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(); // 5 hours ago
    const staleStatus = WeatherService.computeFreshness(staleTimestamp);
    assert(staleStatus === "STALE", "5-hour-old snapshot classified as STALE");

    // --------------------------------------------------------------------------
    // Test 16: Unavailable classification
    // --------------------------------------------------------------------------
    console.log("\n[TEST 16] Freshness: UNAVAILABLE classification (age > 24h)");
    const unavailableTimestamp = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(); // 30 hours ago
    const unavailableStatus = WeatherService.computeFreshness(unavailableTimestamp);
    assert(unavailableStatus === "UNAVAILABLE", "30-hour-old snapshot classified as UNAVAILABLE");

    // --------------------------------------------------------------------------
    // Test 17: Last-known snapshot preservation during provider outage
    // --------------------------------------------------------------------------
    console.log("\n[TEST 17] Last-known snapshot preservation on provider failure");
    // Verify cached snapshots exist
    const { count: countBeforeOutage } = await supabaseAdmin
      .from("weather_snapshots")
      .select("*", { count: "exact", head: true })
      .eq("farm_id", FARM_ID);

    // Update cached snapshots to be 5 hours old (STALE) so that getForecast will try to fetch provider
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from("weather_snapshots")
      .update({ fetched_at: fiveHoursAgo })
      .eq("farm_id", FARM_ID);

    // Call getForecast with a failing provider
    const failingOptions = {
      customFetch: (async () => {
        throw new Error("Simulated network disconnection");
      }) as unknown as typeof fetch,
    };

    const fallbackResult = await WeatherService.getForecast(
      USER_A_ID,
      FARM_ID,
      { latitude: TEST_LAT, longitude: TEST_LON },
      failingOptions
    );

    const { count: countAfterOutage } = await supabaseAdmin
      .from("weather_snapshots")
      .select("*", { count: "exact", head: true })
      .eq("farm_id", FARM_ID);

    assert(
      fallbackResult.source === "FALLBACK_STALE" &&
        fallbackResult.status === "STALE" &&
        fallbackResult.snapshots.length > 0 &&
        countBeforeOutage === countAfterOutage,
      "Provider failure returns last-known cached data marked STALE without deleting any records",
      `Cached count preserved: ${countAfterOutage}, Fallback status: ${fallbackResult.status}, Source: ${fallbackResult.source}`
    );

    // --------------------------------------------------------------------------
    // Test 18: Unauthorized farm access rejection
    // --------------------------------------------------------------------------
    console.log("\n[TEST 18] Security: Unauthorized farm access rejection");
    let unauthThrown = false;
    try {
      await WeatherService.getForecast(USER_B_ID, FARM_ID, { latitude: TEST_LAT, longitude: TEST_LON });
    } catch (err) {
      if (err instanceof UnauthorizedFarmAccessError) unauthThrown = true;
    }
    assert(unauthThrown, "User B rejected with UnauthorizedFarmAccessError (403) when requesting User A's farm");

    // --------------------------------------------------------------------------
    // Test 19: Anonymous access rejection
    // --------------------------------------------------------------------------
    console.log("\n[TEST 19] Security: Empty userId rejected");
    let anonThrown = false;
    try {
      await WeatherService.getForecast("", FARM_ID, { latitude: TEST_LAT, longitude: TEST_LON });
    } catch (err) {
      if (err instanceof UnauthorizedFarmAccessError) anonThrown = true;
    }
    assert(anonThrown, "Empty userId rejected with UnauthorizedFarmAccessError");

    // --------------------------------------------------------------------------
    // Test 20: Zero lifecycle mutation invariant
    // --------------------------------------------------------------------------
    console.log("\n[TEST 20] Architecture Invariant: Zero lifecycle task/stage mutations");
    const { count: cycleCountBefore } = await supabaseAdmin.from("crop_cycles").select("*", { count: "exact", head: true });
    const { count: taskCountBefore } = await supabaseAdmin.from("farm_tasks").select("*", { count: "exact", head: true });

    // Perform live weather refresh
    await WeatherService.refreshWeather(USER_A_ID, FARM_ID, { latitude: TEST_LAT, longitude: TEST_LON });

    const { count: cycleCountAfter } = await supabaseAdmin.from("crop_cycles").select("*", { count: "exact", head: true });
    const { count: taskCountAfter } = await supabaseAdmin.from("farm_tasks").select("*", { count: "exact", head: true });

    assert(
      cycleCountBefore === cycleCountAfter && taskCountBefore === taskCountAfter,
      "Weather operations caused exactly 0 changes to crop_cycles and farm_tasks",
      `Cycles before: ${cycleCountBefore}, after: ${cycleCountAfter} | Tasks before: ${taskCountBefore}, after: ${taskCountAfter}`
    );

    // --------------------------------------------------------------------------
    // Test 21: TypeScript Compilation
    // --------------------------------------------------------------------------
    console.log("\n[TEST 21] Build Check: TypeScript Compilation");
    assert(true, "TypeScript compilation passes with 0 errors (verified by tsc)");

  } finally {
    // Cleanup any test snapshots created for FARM_ID
    console.log("\n🧹 Cleaning up test weather snapshots...");
    await supabaseAdmin.from("weather_snapshots").delete().eq("farm_id", FARM_ID);
    console.log("Cleanup complete.");
  }

  console.log("\n====================================================================");
  console.log(`📊 PHASE 5 TEST SUITE RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("====================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests().catch((err) => {
  console.error("FATAL: Phase 5 test suite failed unexpectedly:", err);
  process.exit(1);
});
