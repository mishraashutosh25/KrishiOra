/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Authoritative Master Knowledge: Bread Wheat (Triticum aestivum)
 * ============================================================================
 * Primary Sources:
 * 1. ICAR - Indian Institute of Wheat and Barley Research (IIWBR), Karnal.
 *    "Wheat Crop Management & Package of Practices", ICAR-IIWBR Extension Bulletin.
 * 2. ICAR - Indian Agricultural Research Institute (IARI), New Delhi.
 *    "Pusa Wheat HD-2967 Production Technology & Varietal Release Guidelines".
 * 3. Punjab Agricultural University (PAU), Ludhiana.
 *    "Package of Practices for Rabi Crops: Wheat", Farm Bulletin No. 43.
 * ============================================================================
 */

import {
  MasterCropRecord,
  MasterVarietyRecord,
  MasterStageTemplateRecord,
  MasterActivityTemplateRecord,
} from "../../types/cropKnowledge.types";

export const WHEAT_CROP_RECORD: MasterCropRecord = {
  crop_code: "WHEAT_BREAD",
  common_name: "Wheat",
  scientific_name: "Triticum aestivum",
  season_category: "Rabi",
  source_reference:
    "ICAR - Indian Institute of Wheat and Barley Research (IIWBR), Karnal. 'Wheat Crop Management & Package of Practices'; ICAR-IARI Division of Agronomy.",
  knowledge_version: "1.0",
  is_active: true,
};

export const WHEAT_VARIETIES: MasterVarietyRecord[] = [
  {
    crop_code: "WHEAT_BREAD",
    variety_code: "HD_2967",
    variety_name: "HD-2967 (Pusa Wheat)",
    typical_duration_days: 140,
    min_duration_days: 130,
    max_duration_days: 148,
    source_reference:
      "ICAR-IARI Variety Release Notification No. 122(E); ICAR-IIWBR All India Coordinated Wheat Improvement Project (AICWIP) Trials.",
    is_active: true,
  },
];

export const WHEAT_STAGE_TEMPLATES: MasterStageTemplateRecord[] = [
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_SOWING",
    stage_name: "Sowing & Germination",
    stage_order: 1,
    typical_start_day_offset: 0,
    typical_end_day_offset: 7,
    is_critical_monitoring: false,
    description:
      "Seed imbibition, radical and coleoptile emergence. Requires adequate residual soil moisture at 4-5 cm depth (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_CRI",
    stage_name: "Crown Root Initiation (CRI)",
    stage_order: 2,
    typical_start_day_offset: 20,
    typical_end_day_offset: 25,
    is_critical_monitoring: true,
    description:
      "Crown roots initiate ~2 cm below soil surface. Most critical physiological stage for 1st irrigation; moisture stress at CRI causes irreversible yield reduction up to 35% (ICAR-IIWBR / PAU).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_TILLERING",
    stage_name: "Active Tillering",
    stage_order: 3,
    typical_start_day_offset: 26,
    typical_end_day_offset: 45,
    is_critical_monitoring: false,
    description:
      "Development of secondary tillers and crown root proliferation. Nitrogen top-dressing required (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_JOINTING",
    stage_name: "Jointing & Stem Elongation",
    stage_order: 4,
    typical_start_day_offset: 46,
    typical_end_day_offset: 70,
    is_critical_monitoring: false,
    description:
      "Internode elongation and embryonic spike development within the leaf sheath (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_FLOWERING",
    stage_name: "Heading & Flowering (Anthesis)",
    stage_order: 5,
    typical_start_day_offset: 71,
    typical_end_day_offset: 90,
    is_critical_monitoring: true,
    description:
      "Spike emergence from the boot leaf followed by pollination. High sensitivity to frost and water stress (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_GRAIN_FILLING",
    stage_name: "Grain Filling (Milk & Dough)",
    stage_order: 6,
    typical_start_day_offset: 91,
    typical_end_day_offset: 120,
    is_critical_monitoring: true,
    description:
      "Starch and protein translocation into developing grain. Highly vulnerable to terminal heat stress if ambient temperature exceeds 32°C (ICAR-IARI).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_MATURITY",
    stage_name: "Physiological Maturity",
    stage_order: 7,
    typical_start_day_offset: 121,
    typical_end_day_offset: 135,
    is_critical_monitoring: false,
    description:
      "Peduncle and glumes turn completely yellow; grain moisture drops below 20% (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_HARVEST",
    stage_name: "Harvest Readiness & Harvesting",
    stage_order: 8,
    typical_start_day_offset: 136,
    typical_end_day_offset: 143,
    is_critical_monitoring: true,
    description:
      "Grains reach harvest moisture of 12-14%. Prompt harvesting prevents lodging, bird damage, and pre-harvest sprouting (ICAR-CIPHET).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_POST_HARVEST",
    stage_name: "Post-Harvest Drying & Storage",
    stage_order: 9,
    typical_start_day_offset: 144,
    typical_end_day_offset: 148,
    is_critical_monitoring: false,
    description:
      "Sun-drying grain to safe storage moisture (<12%) and storage in hermetic or clean pest-free bins (ICAR-CIPHET).",
  },
];

export const WHEAT_ACTIVITY_TEMPLATES: MasterActivityTemplateRecord[] = [
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_SOWING",
    activity_code: "ACT_WHEAT_SOWING",
    activity_title: "Wheat Sowing & Seed Placement",
    activity_category: "SOWING",
    earliest_day_offset: 0,
    target_day_offset: 0,
    latest_day_offset: 4,
    priority: "CRITICAL",
    is_weather_sensitive: true,
    weather_sensitivity_type: "SOIL_MOISTURE_CHECK",
    guidance_notes:
      "Drill seed at 4-5 cm depth with row-to-row spacing of 20-22.5 cm. Ensure optimal soil moisture (vapsa/tar-vatter condition) (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_SOWING",
    activity_code: "ACT_WHEAT_BASAL_FERT",
    activity_title: "Basal Fertilizer Application",
    activity_category: "NUTRIENT",
    earliest_day_offset: 0,
    target_day_offset: 0,
    latest_day_offset: 2,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    guidance_notes:
      "Apply full dose of Phosphorus (P2O5), Potassium (K2O), and 1/3rd to 1/2 of Nitrogen (N) at time of sowing (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_CRI",
    activity_code: "ACT_WHEAT_IRRIG_CRI",
    activity_title: "1st Irrigation at Crown Root Initiation (CRI)",
    activity_category: "IRRIGATION",
    earliest_day_offset: 20,
    target_day_offset: 21,
    latest_day_offset: 25,
    priority: "CRITICAL",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_IRRIG_RAIN_48H",
    guidance_notes:
      "Most critical irrigation for wheat. Delay beyond 25 DAS causes severe tiller mortality and permanent yield reduction (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_TILLERING",
    activity_code: "ACT_WHEAT_WEED_CONTROL",
    activity_title: "Post-Emergence Weed Management Spray",
    activity_category: "PROTECTION",
    earliest_day_offset: 30,
    target_day_offset: 32,
    latest_day_offset: 35,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "HIGH_WIND_AVOIDANCE",
    default_rule_id: "RULE_SPRAY_WIND_15KMH",
    guidance_notes:
      "Apply recommended post-emergence herbicide 30-35 DAS after 1st irrigation when weeds are at 2-3 leaf stage. Do not spray during windy conditions (CIBRC / PAU).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_TILLERING",
    activity_code: "ACT_WHEAT_TOPDRESS_N1",
    activity_title: "1st Nitrogen Top-Dressing",
    activity_category: "NUTRIENT",
    earliest_day_offset: 38,
    target_day_offset: 40,
    latest_day_offset: 45,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    guidance_notes:
      "Top-dress 1/3rd dose of Nitrogen as Urea before or immediately after 2nd irrigation on moist soil (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_TILLERING",
    activity_code: "ACT_WHEAT_IRRIG_TILLER",
    activity_title: "2nd Irrigation (Late Tillering)",
    activity_category: "IRRIGATION",
    earliest_day_offset: 40,
    target_day_offset: 42,
    latest_day_offset: 45,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_IRRIG_RAIN_48H",
    guidance_notes:
      "Supply moisture to sustain secondary tillering and adventitious root growth (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_JOINTING",
    activity_code: "ACT_WHEAT_IRRIG_JOINT",
    activity_title: "3rd Irrigation (Jointing / Boot Stage)",
    activity_category: "IRRIGATION",
    earliest_day_offset: 60,
    target_day_offset: 65,
    latest_day_offset: 70,
    priority: "MEDIUM",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_IRRIG_RAIN_48H",
    guidance_notes:
      "Promotes spike size and spikelet count. Light irrigation recommended (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_GRAIN_FILLING",
    activity_code: "ACT_WHEAT_HEAT_INSPECT",
    activity_title: "Terminal Heat Stress Field Inspection",
    activity_category: "INSPECTION",
    earliest_day_offset: 95,
    target_day_offset: 100,
    latest_day_offset: 105,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "SUNNY_WINDOW_REQUIRED",
    default_rule_id: "RULE_HIGH_TEMP_CRI_WHEAT",
    guidance_notes:
      "Monitor canopy temperature and soil moisture. If temperatures exceed 32°C, provide light evening irrigation to alleviate heat stress (ICAR-IARI).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_GRAIN_FILLING",
    activity_code: "ACT_WHEAT_IRRIG_GRAIN",
    activity_title: "4th Irrigation (Milk Stage)",
    activity_category: "IRRIGATION",
    earliest_day_offset: 95,
    target_day_offset: 100,
    latest_day_offset: 105,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_IRRIG_RAIN_48H",
    guidance_notes:
      "Irrigate during calm winds to avoid crop lodging while grain heads are heavy (ICAR-IIWBR).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_HARVEST",
    activity_code: "ACT_WHEAT_HARVEST",
    activity_title: "Wheat Crop Harvesting",
    activity_category: "HARVEST",
    earliest_day_offset: 136,
    target_day_offset: 140,
    latest_day_offset: 145,
    priority: "CRITICAL",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_HARVEST_RAIN_72H",
    guidance_notes:
      "Harvest when grain moisture is between 12% and 14%. Avoid harvesting if rainfall is imminent within 72 hours (ICAR-CIPHET).",
  },
  {
    crop_code: "WHEAT_BREAD",
    stage_code: "STAGE_WHEAT_POST_HARVEST",
    activity_code: "ACT_WHEAT_DRYING",
    activity_title: "Post-Harvest Grain Sun Drying & Storage",
    activity_category: "POST_HARVEST",
    earliest_day_offset: 144,
    target_day_offset: 145,
    latest_day_offset: 148,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "SUNNY_WINDOW_REQUIRED",
    guidance_notes:
      "Spread grains thinly on clean drying yard or tarpaulin for 2-3 days under direct sunlight until moisture reaches <12% before bagging (ICAR-CIPHET).",
  },
];
