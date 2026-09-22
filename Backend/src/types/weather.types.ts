/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 5: Normalized Weather Domain Types & Interfaces
 * ============================================================================
 * Strict, typed representation of external weather observations and forecasts.
 * Separates FORECAST and HISTORICAL records explicitly.
 * Zero probabilistic or AI fields. Pure deterministic agronomic metrics.
 * ============================================================================
 */

export type WeatherRecordType = "FORECAST" | "HISTORICAL";

export type WeatherConditionCode =
  | "CLEAR"
  | "MAINLY_CLEAR"
  | "PARTLY_CLOUDY"
  | "OVERCAST"
  | "FOG"
  | "DRIZZLE_LIGHT"
  | "DRIZZLE_DENSE"
  | "RAIN_LIGHT"
  | "RAIN_MODERATE"
  | "RAIN_HEAVY"
  | "THUNDERSTORM"
  | "SNOW"
  | "UNKNOWN";

export type WeatherFreshness = "FRESH" | "STALE" | "UNAVAILABLE";

export type WeatherResultSource = "CACHE" | "LIVE_PROVIDER" | "FALLBACK_STALE";

/**
 * Normalized database record representation for `weather_snapshots`.
 */
export interface NormalizedWeatherSnapshot {
  id?: string;
  farm_id: string;
  latitude: number;
  longitude: number;
  forecast_date: string; // YYYY-MM-DD
  observed_at: string; // ISO 8601
  fetched_at: string; // ISO 8601
  rainfall_mm: number;
  rain_probability_pct: number; // 0 - 100
  temp_max_c: number;
  temp_min_c: number;
  humidity_pct: number | null;
  wind_speed_kmh: number;
  condition_code: WeatherConditionCode;
  data_source: string; // 'OPEN_METEO'
  is_stale: boolean;
  record_type: WeatherRecordType;
  created_at?: string;
}

/**
 * Domain query response structure returned to controllers and callers.
 */
export interface WeatherQueryResult {
  status: WeatherFreshness;
  source: WeatherResultSource;
  farm_id: string;
  latitude: number;
  longitude: number;
  fetched_at: string | null;
  record_type: WeatherRecordType;
  snapshots: NormalizedWeatherSnapshot[];
  message?: string;
}

/**
 * Open-Meteo Daily API payload schema contract.
 */
export interface OpenMeteoDailyResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_sum: string;
    precipitation_probability_max?: string;
    wind_speed_10m_max: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max?: (number | null)[];
    wind_speed_10m_max: number[];
  };
}

/**
 * Custom Error Hierarchy for Weather Domain
 */
export class LocationRequiredError extends Error {
  public readonly code = "LOCATION_REQUIRED";
  public readonly statusCode = 400;
  constructor(message = "Explicit valid coordinates (latitude, longitude) are required.") {
    super(message);
    this.name = "LocationRequiredError";
  }
}

export class InvalidCoordinatesError extends Error {
  public readonly code = "INVALID_COORDINATES";
  public readonly statusCode = 400;
  constructor(message = "Coordinates out of bounds. Latitude must be between -90 and 90, Longitude between -180 and 180.") {
    super(message);
    this.name = "InvalidCoordinatesError";
  }
}

export class UnauthorizedFarmAccessError extends Error {
  public readonly code = "UNAUTHORIZED_FARM_ACCESS";
  public readonly statusCode = 403;
  constructor(message = "User does not own or have permission to access this farm.") {
    super(message);
    this.name = "UnauthorizedFarmAccessError";
  }
}

export class FarmNotFoundError extends Error {
  public readonly code = "FARM_NOT_FOUND";
  public readonly statusCode = 404;
  constructor(message = "Farm not found.") {
    super(message);
    this.name = "FarmNotFoundError";
  }
}

export class OpenMeteoTimeoutError extends Error {
  public readonly code = "PROVIDER_TIMEOUT";
  public readonly statusCode = 504;
  constructor(message = "Open-Meteo weather provider request timed out.") {
    super(message);
    this.name = "OpenMeteoTimeoutError";
  }
}

export class OpenMeteoHttpError extends Error {
  public readonly code = "PROVIDER_HTTP_ERROR";
  public readonly statusCode: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "OpenMeteoHttpError";
    this.statusCode = status;
  }
}

export class OpenMeteoMalformedResponseError extends Error {
  public readonly code = "PROVIDER_MALFORMED_RESPONSE";
  public readonly statusCode = 502;
  constructor(message = "Open-Meteo response does not conform to the expected daily contract.") {
    super(message);
    this.name = "OpenMeteoMalformedResponseError";
  }
}
