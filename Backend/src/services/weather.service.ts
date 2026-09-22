/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 5: Weather Integration & Snapshot Engine Service
 * ============================================================================
 * Core business service for weather data management.
 * Invariants:
 *   1. Farm Ownership: User must own the requested farm.
 *   2. Strict Location: Coordinates must be explicit and valid. No geographic fallbacks.
 *   3. Freshness Policy:
 *        FRESH: age <= 3 hours (10,800,000 ms)
 *        STALE: 3 hours < age <= 24 hours
 *        UNAVAILABLE: no data or age > 24h with provider outage
 *   4. Cache vs Refresh:
 *        GET returns complete FRESH cache or fetches from provider.
 *        POST refresh explicitly forces a provider fetch.
 *   5. Fallback Safety: Provider outage preserves last-known good snapshot (marked STALE).
 *   6. Concurrency Safety: Uses database 4-tuple unique constraint for atomic upsert.
 *   7. Zero Lifecycle Mutation: Zero interaction with farm_tasks or crop_cycles.
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import { OpenMeteoAdapter, FetchDailyWeatherOptions } from "../adapters/openMeteo.adapter";
import {
  NormalizedWeatherSnapshot,
  WeatherFreshness,
  WeatherQueryResult,
  WeatherRecordType,
  LocationRequiredError,
  InvalidCoordinatesError,
  UnauthorizedFarmAccessError,
  FarmNotFoundError,
} from "../types/weather.types";
import { addDays, isValidIsoDate } from "../utils/date.utils";

export interface WeatherCoordinates {
  latitude: number;
  longitude: number;
}

export class WeatherService {
  public static readonly FRESH_THRESHOLD_MS = 3 * 60 * 60 * 1000; // 3 hours
  public static readonly STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Validates explicit coordinates. Zero geographic fallbacks allowed.
   */
  public static validateCoordinates(coords?: Partial<WeatherCoordinates> | null): WeatherCoordinates {
    if (
      !coords ||
      coords.latitude === undefined ||
      coords.latitude === null ||
      coords.longitude === undefined ||
      coords.longitude === null ||
      typeof coords.latitude !== "number" ||
      typeof coords.longitude !== "number" ||
      isNaN(coords.latitude) ||
      isNaN(coords.longitude)
    ) {
      throw new LocationRequiredError(
        "Explicit valid coordinates (latitude, longitude) are required. KrishiOra does not support ambiguous geographic fallbacks."
      );
    }

    const { latitude, longitude } = coords;

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new InvalidCoordinatesError(
        `Coordinates out of bounds: (${latitude}, ${longitude}). Latitude must be [-90, 90] and Longitude must be [-180, 180].`
      );
    }

    return { latitude, longitude };
  }

  /**
   * Verifies farm existence and authenticated ownership.
   */
  public static async verifyFarmOwnership(userId: string, farmId: string): Promise<void> {
    const { data: farm, error } = await supabaseAdmin
      .from("farms")
      .select("id, user_id")
      .eq("id", farmId)
      .maybeSingle();

    if (error) {
      console.error(`[WeatherService] Database error checking farm ${farmId}:`, error);
      throw new Error(`Database error verifying farm: ${error.message}`);
    }

    if (!farm) {
      throw new FarmNotFoundError(`Farm '${farmId}' not found.`);
    }

    if (farm.user_id !== userId) {
      console.warn(`[WeatherService] Security: User ${userId} attempted unauthorized weather access to farm ${farmId} (owned by ${farm.user_id})`);
      throw new UnauthorizedFarmAccessError();
    }
  }

  /**
   * Evaluates freshness classification based on fetched_at timestamp.
   */
  public static computeFreshness(fetchedAtIso: string, referenceTimeMs = Date.now()): WeatherFreshness {
    const fetchedTime = new Date(fetchedAtIso).getTime();
    if (isNaN(fetchedTime)) return "UNAVAILABLE";

    const ageMs = referenceTimeMs - fetchedTime;
    if (ageMs <= this.FRESH_THRESHOLD_MS) return "FRESH";
    if (ageMs <= this.STALE_THRESHOLD_MS) return "STALE";
    return "UNAVAILABLE";
  }

  /**
   * Atomically upserts normalized weather snapshots using database unique constraint.
   */
  public static async persistSnapshots(snapshots: NormalizedWeatherSnapshot[]): Promise<NormalizedWeatherSnapshot[]> {
    if (snapshots.length === 0) return [];

    console.log(`[WeatherService] Persisting ${snapshots.length} weather snapshots for farm ${snapshots[0].farm_id}`);

    const { data, error } = await supabaseAdmin
      .from("weather_snapshots")
      .upsert(snapshots, {
        onConflict: "farm_id,forecast_date,data_source,record_type",
      })
      .select();

    if (error) {
      console.error("[WeatherService] Error persisting weather snapshots:", error);
      throw new Error(`Failed to persist weather snapshots: ${error.message}`);
    }

    return (data as NormalizedWeatherSnapshot[]) || snapshots;
  }

  /**
   * Retrieves cached snapshots for a farm, filtered by record_type and date bounds.
   */
  public static async getCachedSnapshots(
    farmId: string,
    recordType: WeatherRecordType,
    minDateIso?: string,
    maxDateIso?: string
  ): Promise<NormalizedWeatherSnapshot[]> {
    let query = supabaseAdmin
      .from("weather_snapshots")
      .select("*")
      .eq("farm_id", farmId)
      .eq("record_type", recordType);

    if (minDateIso) query = query.gte("forecast_date", minDateIso);
    if (maxDateIso) query = query.lte("forecast_date", maxDateIso);

    query = query.order("forecast_date", { ascending: true });

    const { data, error } = await query;
    if (error) {
      console.error(`[WeatherService] Error querying cached weather snapshots for farm ${farmId}:`, error);
      return [];
    }

    return (data as NormalizedWeatherSnapshot[]) || [];
  }

  /**
   * Fetches 7-day forecast. Returns FRESH cache if complete and valid, otherwise fetches provider.
   * If provider fails, falls back to last-known good cached data without deleting it.
   */
  public static async getForecast(
    userId: string,
    farmId: string,
    rawCoords?: Partial<WeatherCoordinates> | null,
    providerOptions?: FetchDailyWeatherOptions
  ): Promise<WeatherQueryResult> {
    await this.verifyFarmOwnership(userId, farmId);
    const coords = this.validateCoordinates(rawCoords);

    const todayIso = new Date().toISOString().slice(0, 10);
    const targetEndDateIso = addDays(todayIso, 6);

    // 1. Check existing cache
    const cached = await this.getCachedSnapshots(farmId, "FORECAST", todayIso, targetEndDateIso);

    // If we have full 7 days cached, check if the oldest snapshot is still FRESH (<= 3h)
    if (cached.length >= 7) {
      const oldestFetchedAt = cached.reduce(
        (min, item) => (item.fetched_at < min ? item.fetched_at : min),
        cached[0].fetched_at
      );
      const freshness = this.computeFreshness(oldestFetchedAt);

      if (freshness === "FRESH") {
        console.log(`[WeatherService] Returning 7-day FRESH cached forecast for farm ${farmId}`);
        return {
          status: "FRESH",
          source: "CACHE",
          farm_id: farmId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          fetched_at: oldestFetchedAt,
          record_type: "FORECAST",
          snapshots: cached,
        };
      }
    }

    // 2. Cache is stale or incomplete -> Fetch from live provider
    try {
      const freshSnapshots = await OpenMeteoAdapter.fetchDailyWeather(
        farmId,
        coords.latitude,
        coords.longitude,
        { ...providerOptions, forecastDays: 7, pastDays: 0 }
      );

      const forecastOnly = freshSnapshots.filter((s) => s.record_type === "FORECAST");
      const persisted = await this.persistSnapshots(forecastOnly);

      return {
        status: "FRESH",
        source: "LIVE_PROVIDER",
        farm_id: farmId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        fetched_at: forecastOnly[0]?.fetched_at || new Date().toISOString(),
        record_type: "FORECAST",
        snapshots: persisted,
      };
    } catch (providerError: unknown) {
      console.warn(`[WeatherService] Live provider failed for farm ${farmId}. Checking fallback cache:`, providerError);

      // Fallback: If we have ANY cached snapshots, preserve them and return marked as STALE
      if (cached.length > 0) {
        const oldestFetchedAt = cached[0].fetched_at;
        return {
          status: "STALE",
          source: "FALLBACK_STALE",
          farm_id: farmId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          fetched_at: oldestFetchedAt,
          record_type: "FORECAST",
          snapshots: cached.map((s) => ({ ...s, is_stale: true })),
          message: `Weather provider unavailable (${providerError instanceof Error ? providerError.message : "Error"}). Serving last-known cached forecast.`,
        };
      }

      // No cache available at all
      return {
        status: "UNAVAILABLE",
        source: "LIVE_PROVIDER",
        farm_id: farmId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        fetched_at: null,
        record_type: "FORECAST",
        snapshots: [],
        message: `Weather provider unavailable and no cached forecast exists: ${
          providerError instanceof Error ? providerError.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Forces a live weather refresh from provider, bypassing cache.
   */
  public static async refreshWeather(
    userId: string,
    farmId: string,
    rawCoords?: Partial<WeatherCoordinates> | null,
    providerOptions?: FetchDailyWeatherOptions
  ): Promise<WeatherQueryResult> {
    await this.verifyFarmOwnership(userId, farmId);
    const coords = this.validateCoordinates(rawCoords);

    console.log(`[WeatherService] Force refreshing weather for farm ${farmId}`);

    const freshSnapshots = await OpenMeteoAdapter.fetchDailyWeather(
      farmId,
      coords.latitude,
      coords.longitude,
      { ...providerOptions, forecastDays: 7, pastDays: 0 }
    );

    const forecastOnly = freshSnapshots.filter((s) => s.record_type === "FORECAST");
    const persisted = await this.persistSnapshots(forecastOnly);

    return {
      status: "FRESH",
      source: "LIVE_PROVIDER",
      farm_id: farmId,
      latitude: coords.latitude,
      longitude: coords.longitude,
      fetched_at: forecastOnly[0]?.fetched_at || new Date().toISOString(),
      record_type: "FORECAST",
      snapshots: persisted,
    };
  }

  /**
   * Fetches historical weather (past 7 days).
   */
  public static async getHistory(
    userId: string,
    farmId: string,
    rawCoords?: Partial<WeatherCoordinates> | null,
    providerOptions?: FetchDailyWeatherOptions
  ): Promise<WeatherQueryResult> {
    await this.verifyFarmOwnership(userId, farmId);
    const coords = this.validateCoordinates(rawCoords);

    const todayIso = new Date().toISOString().slice(0, 10);
    const past7DaysIso = addDays(todayIso, -7);
    const yesterdayIso = addDays(todayIso, -1);

    // 1. Check cache for historical records
    const cached = await this.getCachedSnapshots(farmId, "HISTORICAL", past7DaysIso, yesterdayIso);
    if (cached.length >= 7) {
      console.log(`[WeatherService] Returning cached historical weather for farm ${farmId}`);
      return {
        status: "FRESH",
        source: "CACHE",
        farm_id: farmId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        fetched_at: cached[0]?.fetched_at || null,
        record_type: "HISTORICAL",
        snapshots: cached,
      };
    }

    // 2. Fetch from provider with past_days=7
    try {
      const allSnapshots = await OpenMeteoAdapter.fetchDailyWeather(
        farmId,
        coords.latitude,
        coords.longitude,
        { ...providerOptions, forecastDays: 1, pastDays: 7 }
      );

      const historyOnly = allSnapshots.filter((s) => s.record_type === "HISTORICAL");
      const persisted = await this.persistSnapshots(historyOnly);

      return {
        status: "FRESH",
        source: "LIVE_PROVIDER",
        farm_id: farmId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        fetched_at: historyOnly[0]?.fetched_at || new Date().toISOString(),
        record_type: "HISTORICAL",
        snapshots: persisted,
      };
    } catch (providerError: unknown) {
      console.warn(`[WeatherService] Live provider failed for historical weather on farm ${farmId}:`, providerError);

      if (cached.length > 0) {
        return {
          status: "STALE",
          source: "FALLBACK_STALE",
          farm_id: farmId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          fetched_at: cached[0].fetched_at,
          record_type: "HISTORICAL",
          snapshots: cached.map((s) => ({ ...s, is_stale: true })),
          message: "Weather provider unavailable. Serving last-known cached historical weather.",
        };
      }

      return {
        status: "UNAVAILABLE",
        source: "LIVE_PROVIDER",
        farm_id: farmId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        fetched_at: null,
        record_type: "HISTORICAL",
        snapshots: [],
        message: "No historical weather available.",
      };
    }
  }
}
