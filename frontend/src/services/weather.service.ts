import api from "./api";

export interface DailyWeatherSnapshot {
  id?: string;
  farm_id: string;
  forecast_date: string;
  temp_max_c: number;
  temp_min_c: number;
  temp_mean_c?: number;
  precipitation_sum_mm: number;
  precipitation_probability_max?: number;
  wind_speed_max_kmh: number;
  et0_fao_evapotranspiration_mm?: number;
  dew_point_mean_c?: number;
  record_type?: string;
  data_source?: string;
  fetched_at?: string;
}

export interface WeatherQueryResult {
  status: "FRESH" | "STALE" | "UNAVAILABLE";
  source: string;
  farm_id: string;
  latitude: number;
  longitude: number;
  count: number;
  data: DailyWeatherSnapshot[];
  fetched_at: string;
}

export interface RuleEvaluationResult {
  cycleId: string;
  evaluatedAt: string;
  totalTasksEvaluated: number;
  rulesFiredCount: number;
  evaluations: Array<{
    taskId: string;
    taskTitle?: string;
    ruleId: string;
    ruleName: string;
    triggered: boolean;
    recommendedAction: "MAINTAIN_SCHEDULE" | "DELAY" | "ADVANCE" | "ALERT_ONLY";
    daysOffset?: number;
    explanation: string;
    conditionDetails?: Record<string, any>;
  }>;
}

export const weatherService = {
  // Default coordinates (Punjab agricultural belt) if GPS is not granted
  DEFAULT_COORDS: { latitude: 30.901, longitude: 75.8573 },

  /**
   * Fetches 7-day live weather forecast for a farm
   */
  async getFarmForecast(
    farmId: string,
    coords?: { latitude: number; longitude: number }
  ): Promise<WeatherQueryResult | null> {
    try {
      const lat = coords?.latitude || this.DEFAULT_COORDS.latitude;
      const lon = coords?.longitude || this.DEFAULT_COORDS.longitude;

      const res = await api.get<{ success: boolean; data: WeatherQueryResult }>(
        `/weather/farms/${farmId}/forecast`,
        { params: { lat, lon } }
      );
      return res.data.data;
    } catch (err) {
      console.warn("[WeatherService] Failed to load farm forecast:", err);
      return null;
    }
  },

  /**
   * Evaluates agronomic rules (Rain, Frost, High Wind) against active cycle tasks
   */
  async evaluateCycle(
    cycleId: string,
    coords?: { latitude: number; longitude: number }
  ): Promise<RuleEvaluationResult | null> {
    try {
      const lat = coords?.latitude || this.DEFAULT_COORDS.latitude;
      const lon = coords?.longitude || this.DEFAULT_COORDS.longitude;

      const res = await api.post<{ success: boolean; data: RuleEvaluationResult }>(
        `/rules/cycles/${cycleId}/evaluate`,
        { latitude: lat, longitude: lon }
      );
      return res.data.data;
    } catch (err) {
      console.warn("[WeatherService] Failed to evaluate cycle weather rules:", err);
      return null;
    }
  },

  /**
   * Reschedules a task based on weather advisory recommendation
   */
  async rescheduleTask(
    taskId: string,
    newTargetDate: string,
    reason: string,
    ruleId?: string
  ) {
    const res = await api.post<{ success: boolean; data: any }>(
      `/replanning/tasks/${taskId}/reschedule`,
      {
        newTargetDate,
        reason,
        ruleId,
      }
    );
    return res.data.data;
  },
};

export default weatherService;
