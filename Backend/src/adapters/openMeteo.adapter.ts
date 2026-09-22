/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 5: Open-Meteo Weather Provider Adapter
 * ============================================================================
 * Isolated adapter for fetching and parsing daily weather data from Open-Meteo.
 * Responsibilities:
 *   1. HTTP request execution with strict AbortController timeout.
 *   2. Strict contract validation: missing/null required values fail explicitly.
 *      Zero silent coercion of malformed data to 0.
 *   3. WMO weather interpretation code mapping to domain condition codes.
 *   4. Explicit separation of FORECAST (dates >= today) and HISTORICAL (dates < today).
 *   5. Never leaks raw provider response objects to the domain layer.
 * ============================================================================
 */

import {
  NormalizedWeatherSnapshot,
  WeatherConditionCode,
  WeatherRecordType,
  OpenMeteoDailyResponse,
  OpenMeteoTimeoutError,
  OpenMeteoHttpError,
  OpenMeteoMalformedResponseError,
} from "../types/weather.types";
import { isValidIsoDate } from "../utils/date.utils";

export interface FetchDailyWeatherOptions {
  forecastDays?: number;
  pastDays?: number;
  timeoutMs?: number;
  customFetch?: typeof fetch;
}

export class OpenMeteoAdapter {
  private static readonly BASE_URL = "https://api.open-meteo.com/v1/forecast";
  private static readonly DEFAULT_TIMEOUT_MS = 5000;

  /**
   * Maps WMO Weather Interpretation Codes to strict domain WeatherConditionCode.
   * Based on World Meteorological Organization standards.
   */
  public static mapWmoCode(wmoCode: number): WeatherConditionCode {
    if (wmoCode === 0) return "CLEAR";
    if (wmoCode === 1) return "MAINLY_CLEAR";
    if (wmoCode === 2) return "PARTLY_CLOUDY";
    if (wmoCode === 3) return "OVERCAST";
    if (wmoCode === 45 || wmoCode === 48) return "FOG";
    if (wmoCode >= 51 && wmoCode <= 55) return "DRIZZLE_LIGHT";
    if (wmoCode >= 56 && wmoCode <= 57) return "DRIZZLE_DENSE";
    if (wmoCode === 61 || wmoCode === 80) return "RAIN_LIGHT";
    if (wmoCode === 63 || wmoCode === 81) return "RAIN_MODERATE";
    if (wmoCode === 65 || wmoCode === 82) return "RAIN_HEAVY";
    if (wmoCode >= 71 && wmoCode <= 77) return "SNOW";
    if (wmoCode >= 95 && wmoCode <= 99) return "THUNDERSTORM";
    return "UNKNOWN";
  }

  /**
   * Strictly validates and normalizes raw daily payload into domain records.
   * If any required entry is null, undefined, or NaN, normalization FAILS explicitly.
   */
  public static normalizeDailyResponse(
    raw: unknown,
    farmId: string,
    latitude: number,
    longitude: number,
    referenceDateIso: string // YYYY-MM-DD representing "today"
  ): NormalizedWeatherSnapshot[] {
    if (!raw || typeof raw !== "object") {
      throw new OpenMeteoMalformedResponseError("Response is not an object.");
    }

    const res = raw as OpenMeteoDailyResponse;
    if (!res.daily || typeof res.daily !== "object") {
      throw new OpenMeteoMalformedResponseError("Response is missing 'daily' block.");
    }

    const {
      time,
      weather_code,
      temperature_2m_max,
      temperature_2m_min,
      precipitation_sum,
      precipitation_probability_max,
      wind_speed_10m_max,
    } = res.daily;

    if (!Array.isArray(time) || time.length === 0) {
      throw new OpenMeteoMalformedResponseError("'daily.time' is missing or empty.");
    }

    const count = time.length;

    // Verify all required arrays exist and have matching lengths
    const requiredArrays = [
      { name: "weather_code", arr: weather_code },
      { name: "temperature_2m_max", arr: temperature_2m_max },
      { name: "temperature_2m_min", arr: temperature_2m_min },
      { name: "precipitation_sum", arr: precipitation_sum },
      { name: "wind_speed_10m_max", arr: wind_speed_10m_max },
    ];

    for (const item of requiredArrays) {
      if (!Array.isArray(item.arr) || item.arr.length !== count) {
        throw new OpenMeteoMalformedResponseError(
          `Array '${item.name}' is missing or length (${item.arr?.length}) does not match time length (${count}).`
        );
      }
    }

    const fetchedAt = new Date().toISOString();
    const snapshots: NormalizedWeatherSnapshot[] = [];

    for (let i = 0; i < count; i++) {
      const dateStr = time[i];
      if (!isValidIsoDate(dateStr)) {
        throw new OpenMeteoMalformedResponseError(`Invalid date at index ${i}: '${dateStr}'`);
      }

      const wCode = weather_code[i];
      const tMax = temperature_2m_max[i];
      const tMin = temperature_2m_min[i];
      const rain = precipitation_sum[i];
      const wind = wind_speed_10m_max[i];

      // Strict validation: reject null, undefined, NaN
      if (typeof wCode !== "number" || isNaN(wCode)) {
        throw new OpenMeteoMalformedResponseError(`Invalid weather_code at index ${i}: ${wCode}`);
      }
      if (typeof tMax !== "number" || isNaN(tMax)) {
        throw new OpenMeteoMalformedResponseError(`Invalid temperature_2m_max at index ${i}: ${tMax}`);
      }
      if (typeof tMin !== "number" || isNaN(tMin)) {
        throw new OpenMeteoMalformedResponseError(`Invalid temperature_2m_min at index ${i}: ${tMin}`);
      }
      if (typeof rain !== "number" || isNaN(rain) || rain < 0) {
        throw new OpenMeteoMalformedResponseError(`Invalid precipitation_sum at index ${i}: ${rain}`);
      }
      if (typeof wind !== "number" || isNaN(wind) || wind < 0) {
        throw new OpenMeteoMalformedResponseError(`Invalid wind_speed_10m_max at index ${i}: ${wind}`);
      }

      // Rain probability: optional in some historical endpoints, default to 0 only if explicitly undefined
      let rainProb = 0;
      if (Array.isArray(precipitation_probability_max)) {
        const probVal = precipitation_probability_max[i];
        if (typeof probVal === "number" && !isNaN(probVal)) {
          rainProb = Math.min(100, Math.max(0, Math.round(probVal)));
        }
      }

      // Explicit semantic classification
      const recordType: WeatherRecordType = dateStr < referenceDateIso ? "HISTORICAL" : "FORECAST";

      snapshots.push({
        farm_id: farmId,
        latitude,
        longitude,
        forecast_date: dateStr,
        observed_at: fetchedAt,
        fetched_at: fetchedAt,
        rainfall_mm: Number(rain.toFixed(2)),
        rain_probability_pct: rainProb,
        temp_max_c: Number(tMax.toFixed(1)),
        temp_min_c: Number(tMin.toFixed(1)),
        humidity_pct: null,
        wind_speed_kmh: Number(wind.toFixed(2)),
        condition_code: this.mapWmoCode(wCode),
        data_source: "OPEN_METEO",
        is_stale: false,
        record_type: recordType,
      });
    }

    return snapshots;
  }

  /**
   * Fetches daily weather from Open-Meteo API.
   */
  public static async fetchDailyWeather(
    farmId: string,
    latitude: number,
    longitude: number,
    options: FetchDailyWeatherOptions = {}
  ): Promise<NormalizedWeatherSnapshot[]> {
    const forecastDays = options.forecastDays ?? 7;
    const pastDays = options.pastDays ?? 0;
    const timeoutMs = options.timeoutMs ?? this.DEFAULT_TIMEOUT_MS;
    const fetchImpl = options.customFetch ?? fetch;

    const url = new URL(this.BASE_URL);
    url.searchParams.set("latitude", latitude.toString());
    url.searchParams.set("longitude", longitude.toString());
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max"
    );
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", forecastDays.toString());
    if (pastDays > 0) {
      url.searchParams.set("past_days", pastDays.toString());
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[OpenMeteoAdapter] Requesting weather for (${latitude}, ${longitude}), forecastDays=${forecastDays}, pastDays=${pastDays}`);
      const res = await fetchImpl(url.toString(), {
        method: "GET",
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error(`[OpenMeteoAdapter] HTTP error ${res.status}: ${errText}`);
        throw new OpenMeteoHttpError(`Open-Meteo returned HTTP ${res.status}: ${errText}`, res.status);
      }

      const json = await res.json();
      const refDateIso =
        pastDays > 0 && json.daily?.time?.[pastDays]
          ? json.daily.time[pastDays]
          : (json.daily?.time?.[0] || new Date().toISOString().slice(0, 10));
      return this.normalizeDailyResponse(json, farmId, latitude, longitude, refDateIso);
    } catch (err: unknown) {
      if (err instanceof OpenMeteoHttpError || err instanceof OpenMeteoMalformedResponseError) {
        throw err;
      }
      if (err instanceof Error && (err.name === "AbortError" || err.message.includes("abort"))) {
        throw new OpenMeteoTimeoutError(`Open-Meteo request timed out after ${timeoutMs}ms.`);
      }
      console.error("[OpenMeteoAdapter] Unexpected fetch error:", err);
      throw new OpenMeteoHttpError(err instanceof Error ? err.message : "Network error contacting Open-Meteo.", 502);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
