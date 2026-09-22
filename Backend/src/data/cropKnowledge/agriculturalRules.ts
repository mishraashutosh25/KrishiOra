/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Authoritative Master Knowledge: Agricultural Rules & Versioning
 * ============================================================================
 * Pure deterministic, explainable, source-backed agricultural decision rules.
 * No AI, LLM, or probabilistic guesses.
 * ============================================================================
 * Primary Sources:
 * 1. ICAR - Indian Institute of Wheat and Barley Research (IIWBR), Karnal.
 * 2. Central Insecticides Board & Registration Committee (CIBRC) GAP Guidelines.
 * 3. ICAR - Central Institute of Post-Harvest Engineering & Technology (CIPHET).
 * 4. ICAR - Indian Agricultural Research Institute (IARI), Division of Agronomy.
 * ============================================================================
 */

import { AgriculturalRuleRecord } from "../../types/cropKnowledge.types";

/**
 * Authoritative Active Agricultural Rules (Version 1.0)
 * These records are deployed into `agricultural_rules`.
 */
export const ACTIVE_AGRICULTURAL_RULES: AgriculturalRuleRecord[] = [
  {
    id: "RULE_IRRIG_RAIN_48H",
    rule_version: "1.0",
    rule_name: "Rainfall Postponement for Scheduled Irrigation",
    category: "IRRIGATION",
    source_citation:
      "ICAR - Indian Institute of Wheat and Barley Research (IIWBR) Irrigation Management Guidelines; Punjab Agricultural University (PAU) Farm Bulletin No. 43.",
    effective_from: "2026-01-01",
    review_status: "VERIFIED",
    condition_expression: {
      forecast_window_hours: 48,
      rainfall_threshold_mm: 10.0,
      rain_probability_threshold_pct: 60,
    },
    action_type: "RESCHEDULE_TASK",
    explanation_template:
      "Irrigation postponed by {reschedule_days} days because forecast indicates {rainfall_mm}mm of rain (>= {rainfall_threshold_mm}mm threshold) within {forecast_window_hours} hours with {rain_probability_pct}% probability. Surface soil moisture will be replenished by precipitation, avoiding root zone waterlogging and nutrient leaching.",
  },
  {
    id: "RULE_SPRAY_WIND_15KMH",
    rule_version: "1.0",
    rule_name: "High Wind Spraying Drift Restriction",
    category: "SPRAYING",
    source_citation:
      "Central Insecticides Board & Registration Committee (CIBRC) Code of Good Agricultural Practice (GAP) for Chemical Application; FAO Plant Protection Paper 112.",
    effective_from: "2026-01-01",
    review_status: "VERIFIED",
    condition_expression: {
      forecast_window_hours: 24,
      max_wind_speed_kmh: 15.0,
    },
    action_type: "HOLD_FOR_INSPECTION",
    explanation_template:
      "Spraying task placed on hold because sustained wind speed is forecast at {wind_speed_kmh} km/h (exceeding safe limit of {max_wind_speed_kmh} km/h). High wind causes chemical droplet drift, poor target canopy coverage, and off-target agrochemical contamination.",
  },
  {
    id: "RULE_HARVEST_RAIN_72H",
    rule_version: "1.0",
    rule_name: "Harvest Operations Pre-Rain Protection",
    category: "HARVEST",
    source_citation:
      "ICAR - Central Institute of Post-Harvest Engineering and Technology (CIPHET) Guidelines on Grain Harvesting and Pre-Harvest Weather Preparedness.",
    effective_from: "2026-01-01",
    review_status: "VERIFIED",
    condition_expression: {
      forecast_window_hours: 72,
      rainfall_threshold_mm: 5.0,
      rain_probability_threshold_pct: 50,
    },
    action_type: "EMIT_WARNING",
    explanation_template:
      "Warning: Approaching rainfall ({rainfall_mm}mm forecast within {forecast_window_hours} hours). Grains harvested or drying in the open field risk fungal germination (sprouting in ear), discoloration, and aflatoxin contamination. Accelerate threshing and secure covered storage.",
  },
  {
    id: "RULE_HIGH_TEMP_CRI_WHEAT",
    rule_version: "1.0",
    rule_name: "Terminal Heat Stress Alert during Wheat Grain Filling",
    category: "RISK_ALERT",
    source_citation:
      "ICAR - Indian Agricultural Research Institute (IARI) Division of Agronomy Bulletin on Climate-Resilient Wheat Production in NWPZ; ICAR-IIWBR Technical Report 108.",
    effective_from: "2026-01-01",
    review_status: "VERIFIED",
    condition_expression: {
      crop_code: "WHEAT_BREAD",
      stage_code: "STAGE_WHEAT_GRAIN_FILLING",
      temp_max_threshold_c: 32.0,
      consecutive_days: 2,
    },
    action_type: "EMIT_WARNING",
    explanation_template:
      "High temperature alert: Forecast ambient temperature exceeds {temp_max_threshold_c}°C for {consecutive_days} consecutive days during grain filling stage. Extended high temperature causes premature grain desiccation (shriveling) and reduced test weight. Provide light canopy irrigation during calm evening hours to cool microclimate.",
  },
];

/**
 * Historical and Versioned Rules Registry
 * Supports historical reproducibility (Requirement 8 & Test 12).
 * Even if a rule is upgraded in the future, previous versions remain retrievable.
 */
export const HISTORICAL_RULE_VERSIONS: AgriculturalRuleRecord[] = [
  ...ACTIVE_AGRICULTURAL_RULES,
  {
    id: "RULE_IRRIG_RAIN_48H",
    rule_version: "0.9-PILOT",
    rule_name: "Rainfall Postponement for Scheduled Irrigation (Pilot Standard)",
    category: "IRRIGATION",
    source_citation:
      "ICAR - IIWBR Preliminary Agronomy Circular 2025/08.",
    effective_from: "2025-06-01",
    review_status: "DEPRECATED",
    condition_expression: {
      forecast_window_hours: 48,
      rainfall_threshold_mm: 15.0,
      rain_probability_threshold_pct: 70,
    },
    action_type: "RESCHEDULE_TASK",
    explanation_template:
      "Historical v0.9 pilot rule: Postponed irrigation when rain forecast >= 15mm.",
  },
];
