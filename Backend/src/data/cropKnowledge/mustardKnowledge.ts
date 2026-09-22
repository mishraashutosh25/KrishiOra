/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Authoritative Master Knowledge: Indian Mustard (Brassica juncea)
 * ============================================================================
 * Primary Sources:
 * 1. ICAR - Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur.
 *    "Package of Practices for Rapeseed-Mustard Cultivation", Technical Bulletin No. 28.
 * 2. Chaudhary Charan Singh Haryana Agricultural University (CCS HAU), Hisar.
 *    "Package of Practices for Rabi Crops - Oilseeds", HAU Extension Directorate.
 * 3. ICAR - Indian Agricultural Research Institute (IARI), New Delhi.
 *    "Pusa Bold Indian Mustard Characteristic & Cultivation Guidelines".
 * ============================================================================
 */

import {
  MasterCropRecord,
  MasterVarietyRecord,
  MasterStageTemplateRecord,
  MasterActivityTemplateRecord,
} from "../../types/cropKnowledge.types";

export const MUSTARD_CROP_RECORD: MasterCropRecord = {
  crop_code: "MUSTARD_INDIAN",
  common_name: "Indian Mustard (Raya)",
  scientific_name: "Brassica juncea",
  season_category: "Rabi",
  source_reference:
    "ICAR - Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur; CCS HAU Hisar Oilseeds Directorate.",
  knowledge_version: "1.0",
  is_active: true,
};

export const MUSTARD_VARIETIES: MasterVarietyRecord[] = [
  {
    crop_code: "MUSTARD_INDIAN",
    variety_code: "RH_749",
    variety_name: "RH-749 (CCS HAU Raya)",
    typical_duration_days: 138,
    min_duration_days: 130,
    max_duration_days: 145,
    source_reference:
      "CCS HAU Hisar Variety Release Gazette Notification; ICAR-DRMR All India Coordinated Research Project on Rapeseed-Mustard (AICRP-RM).",
    is_active: true,
  },
  {
    crop_code: "MUSTARD_INDIAN",
    variety_code: "PUSA_BOLD",
    variety_name: "Pusa Bold",
    typical_duration_days: 135,
    min_duration_days: 125,
    max_duration_days: 142,
    source_reference:
      "ICAR-IARI Variety Release Notification; ICAR-DRMR Technical Bulletin on High-Yielding Mustard Varieties.",
    is_active: true,
  },
];

export const MUSTARD_STAGE_TEMPLATES: MasterStageTemplateRecord[] = [
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_EMERGENCE",
    stage_name: "Germination & Emergence",
    stage_order: 1,
    typical_start_day_offset: 0,
    typical_end_day_offset: 8,
    is_critical_monitoring: false,
    description:
      "Hypocotyl emergence and cotyledon unfolding. Optimum sowing depth is 3-4 cm in moist seedbed (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_ROSETTE",
    stage_name: "Rosette Vegetative Stage",
    stage_order: 2,
    typical_start_day_offset: 9,
    typical_end_day_offset: 25,
    is_critical_monitoring: false,
    description:
      "True leaf proliferation forming a basal rosette. Intra-row plant thinning must be completed by 15-20 DAS (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_BRANCHING",
    stage_name: "Stem Elongation & Primary/Secondary Branching",
    stage_order: 3,
    typical_start_day_offset: 26,
    typical_end_day_offset: 45,
    is_critical_monitoring: true,
    description:
      "Rapid stem extension and secondary branches formation. Critical stage for 1st irrigation (30-35 DAS) and early aphid scout (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_FLOWERING",
    stage_name: "Flowering & Inflorescence",
    stage_order: 4,
    typical_start_day_offset: 46,
    typical_end_day_offset: 75,
    is_critical_monitoring: true,
    description:
      "Intense bright yellow blooming and honeybee pollination. Avoid insecticide sprays during morning foraging hours (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_POD_FORMATION",
    stage_name: "Siliqua (Pod) Development & Seed Filling",
    stage_order: 5,
    typical_start_day_offset: 76,
    typical_end_day_offset: 105,
    is_critical_monitoring: false,
    description:
      "Siliquae elongate and ovules develop into oil-rich seeds. 2nd irrigation required at 70-75 DAS if winter rains fail (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_MATURITY",
    stage_name: "Physiological Maturity",
    stage_order: 6,
    typical_start_day_offset: 106,
    typical_end_day_offset: 125,
    is_critical_monitoring: false,
    description:
      "Siliquae turn from green to brownish-yellow; seeds turn dark brown/black with <15% moisture (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_HARVEST",
    stage_name: "Harvesting & Bundling",
    stage_order: 7,
    typical_start_day_offset: 126,
    typical_end_day_offset: 138,
    is_critical_monitoring: true,
    description:
      "Harvest when 75-80% pods turn yellow. Harvest early morning when dew keeps pods pliable to avoid pod shattering loss (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_POST_HARVEST",
    stage_name: "Threshing, Sun Drying & Storage",
    stage_order: 8,
    typical_start_day_offset: 139,
    typical_end_day_offset: 145,
    is_critical_monitoring: false,
    description:
      "Sun dry threshed seeds on floor for 4-5 days until seed moisture drops below 8% to prevent rancidity and fungal decay in storage (ICAR-DRMR).",
  },
];

export const MUSTARD_ACTIVITY_TEMPLATES: MasterActivityTemplateRecord[] = [
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_EMERGENCE",
    activity_code: "ACT_MUSTARD_SOWING",
    activity_title: "Mustard Sowing & Basal Fertilization",
    activity_category: "SOWING",
    earliest_day_offset: 0,
    target_day_offset: 0,
    latest_day_offset: 3,
    priority: "CRITICAL",
    is_weather_sensitive: true,
    weather_sensitivity_type: "SOIL_MOISTURE_CHECK",
    guidance_notes:
      "Sow with seed drill at 4-5 kg/ha seed rate with 30-45 cm line spacing at 3-4 cm depth into moist seedbed (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_ROSETTE",
    activity_code: "ACT_MUSTARD_THINNING",
    activity_title: "Plant Thinning & Hand Weeding",
    activity_category: "INSPECTION",
    earliest_day_offset: 15,
    target_day_offset: 18,
    latest_day_offset: 22,
    priority: "HIGH",
    is_weather_sensitive: false,
    guidance_notes:
      "Thin out dense seedlings to maintain 10-15 cm spacing between plants within rows. Overcrowding reduces branching and siliqua count (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_BRANCHING",
    activity_code: "ACT_MUSTARD_IRRIG_FLOWER",
    activity_title: "1st Irrigation at Pre-Flowering / Branching",
    activity_category: "IRRIGATION",
    earliest_day_offset: 32,
    target_day_offset: 35,
    latest_day_offset: 40,
    priority: "CRITICAL",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_IRRIG_RAIN_48H",
    guidance_notes:
      "Critical irrigation stage. Apply 5-6 cm light irrigation. If winter rains occur, postpone as excess moisture causes root rot and white rust (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_FLOWERING",
    activity_code: "ACT_MUSTARD_APHID_SCOUT",
    activity_title: "Mustard Aphid (Lipaphis erysimi) Scouting & Bio-Control",
    activity_category: "PROTECTION",
    earliest_day_offset: 50,
    target_day_offset: 55,
    latest_day_offset: 60,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "SUNNY_WINDOW_REQUIRED",
    guidance_notes:
      "Examine terminal central twigs across 20 spots. Economic Threshold Level (ETL): 25-30 aphids/twig or 1.5-2 cm infestation length (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_POD_FORMATION",
    activity_code: "ACT_MUSTARD_IRRIG_POD",
    activity_title: "2nd Irrigation at Siliqua / Pod Formation",
    activity_category: "IRRIGATION",
    earliest_day_offset: 70,
    target_day_offset: 75,
    latest_day_offset: 80,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_IRRIG_RAIN_48H",
    guidance_notes:
      "Apply light irrigation at pod filling stage. Irrigate during calm weather to prevent plant lodging (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_HARVEST",
    activity_code: "ACT_MUSTARD_HARVEST",
    activity_title: "Morning Harvesting (To Prevent Pod Shattering)",
    activity_category: "HARVEST",
    earliest_day_offset: 126,
    target_day_offset: 132,
    latest_day_offset: 140,
    priority: "CRITICAL",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_HARVEST_RAIN_72H",
    guidance_notes:
      "Cut plants close to ground during morning hours when siliquae are dew-moist to eliminate shattering losses. Stack in small bundles for drying (ICAR-DRMR).",
  },
  {
    crop_code: "MUSTARD_INDIAN",
    stage_code: "STAGE_MUSTARD_POST_HARVEST",
    activity_code: "ACT_MUSTARD_DRYING",
    activity_title: "Threshing & Seed Sun Drying to <8% Moisture",
    activity_category: "POST_HARVEST",
    earliest_day_offset: 138,
    target_day_offset: 140,
    latest_day_offset: 145,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "SUNNY_WINDOW_REQUIRED",
    guidance_notes:
      "Thresh when bundles are sun-dried. Spread seeds on tarpaulin in direct sunlight until moisture is below 8% for safe storage without oil degradation (ICAR-DRMR).",
  },
];
