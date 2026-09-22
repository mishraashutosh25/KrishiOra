/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Authoritative Master Knowledge: Desi Chickpea (Cicer arietinum)
 * ============================================================================
 * Primary Sources:
 * 1. ICAR - Indian Institute of Pulses Research (IIPR), Kanpur.
 *    "Package of Practices for Chickpea Cultivation in India", IIPR Bulletin No. 34.
 * 2. Jawaharlal Nehru Krishi Vishwa Vidyalaya (JNKVV), Jabalpur & ICRISAT.
 *    "JG-11 Chickpea Characteristic & Production Technology Gazette".
 * 3. ICAR - Indian Agricultural Research Institute (IARI), New Delhi.
 *    "Pusa-362 Desi Chickpea Production Guidelines for Northern & Central Plains".
 * ============================================================================
 */

import {
  MasterCropRecord,
  MasterVarietyRecord,
  MasterStageTemplateRecord,
  MasterActivityTemplateRecord,
} from "../../types/cropKnowledge.types";

export const CHICKPEA_CROP_RECORD: MasterCropRecord = {
  crop_code: "CHICKPEA_DESI",
  common_name: "Chickpea (Gram / Chana)",
  scientific_name: "Cicer arietinum",
  season_category: "Rabi",
  source_reference:
    "ICAR - Indian Institute of Pulses Research (IIPR), Kanpur. 'Package of Practices for Chickpea Cultivation in India'.",
  knowledge_version: "1.0",
  is_active: true,
};

export const CHICKPEA_VARIETIES: MasterVarietyRecord[] = [
  {
    crop_code: "CHICKPEA_DESI",
    variety_code: "JG_11",
    variety_name: "JG-11 (Jawahar Gram)",
    typical_duration_days: 115,
    min_duration_days: 105,
    max_duration_days: 125,
    source_reference:
      "JNKVV Jabalpur & ICRISAT Varietal Release Notification; ICAR-IIPR All India Coordinated Research Project on Chickpea (AICRP-Chickpea).",
    is_active: true,
  },
  {
    crop_code: "CHICKPEA_DESI",
    variety_code: "PUSA_362",
    variety_name: "Pusa-362",
    typical_duration_days: 120,
    min_duration_days: 110,
    max_duration_days: 130,
    source_reference:
      "ICAR-IARI Variety Release Notification; ICAR-IIPR Performance Bulletin on Desi Chickpea Varieties.",
    is_active: true,
  },
];

export const CHICKPEA_STAGE_TEMPLATES: MasterStageTemplateRecord[] = [
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_EMERGENCE",
    stage_name: "Germination & Seedling Emergence",
    stage_order: 1,
    typical_start_day_offset: 0,
    typical_end_day_offset: 10,
    is_critical_monitoring: false,
    description:
      "Sub-surface hypocotyl growth and seedling emergence. Sowing depth 8-10 cm in light soils, 5-7 cm in heavier soils (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_NODULATION",
    stage_name: "Vegetative Branching & Active Nodulation",
    stage_order: 2,
    typical_start_day_offset: 11,
    typical_end_day_offset: 35,
    is_critical_monitoring: false,
    description:
      "Primary and secondary branching with active root nodulation by Mesorhizobium ciceri for atmospheric nitrogen fixation (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_PRE_FLOWER",
    stage_name: "Pre-Flowering Flush",
    stage_order: 3,
    typical_start_day_offset: 36,
    typical_end_day_offset: 50,
    is_critical_monitoring: true,
    description:
      "Flower bud initiation. Critical stage for 1st light irrigation if soil moisture is deficient (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_FLOWERING",
    stage_name: "Flowering & Early Pod Set",
    stage_order: 4,
    typical_start_day_offset: 51,
    typical_end_day_offset: 75,
    is_critical_monitoring: true,
    description:
      "Profuse flowering and early pod set. Strictly avoid heavy flood irrigation during flowering to prevent flower drop and vegetative resurgence (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_POD_DEV",
    stage_name: "Pod Development & Grain Filling",
    stage_order: 5,
    typical_start_day_offset: 76,
    typical_end_day_offset: 100,
    is_critical_monitoring: true,
    description:
      "Pod expansion and seed enlargement. Critical period for Helicoverpa armigera (gram pod borer) monitoring and 2nd light irrigation (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_MATURITY",
    stage_name: "Physiological Maturity",
    stage_order: 6,
    typical_start_day_offset: 101,
    typical_end_day_offset: 115,
    is_critical_monitoring: false,
    description:
      "Leaves turn straw-yellow, pods turn golden brown, and seeds rattle inside pods when shaken (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_HARVEST",
    stage_name: "Harvesting & Bundle Sun-Drying",
    stage_order: 7,
    typical_start_day_offset: 116,
    typical_end_day_offset: 125,
    is_critical_monitoring: true,
    description:
      "Manual pulling or sickle cutting of dried plants. Sun-dry in field bundles for 3-4 days before mechanical or bullock threshing (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_POST_HARVEST",
    stage_name: "Seed Sun Drying & Bruchid Protection",
    stage_order: 8,
    typical_start_day_offset: 126,
    typical_end_day_offset: 130,
    is_critical_monitoring: false,
    description:
      "Dry cleaned grains to 9-10% moisture. Store in hermetic bins with activated neem oil or inert dust to protect against pulse beetle (Callosobruchus chinensis) (ICAR-CIPHET).",
  },
];

export const CHICKPEA_ACTIVITY_TEMPLATES: MasterActivityTemplateRecord[] = [
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_EMERGENCE",
    activity_code: "ACT_CHICKPEA_SOWING",
    activity_title: "Chickpea Sowing with Mesorhizobium Seed Inoculation",
    activity_category: "SOWING",
    earliest_day_offset: 0,
    target_day_offset: 0,
    latest_day_offset: 4,
    priority: "CRITICAL",
    is_weather_sensitive: true,
    weather_sensitivity_type: "SOIL_MOISTURE_CHECK",
    guidance_notes:
      "Treat seeds with Mesorhizobium ciceri and Trichoderma viride culture before sowing. Drill at 30 cm row spacing in conserved moisture (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_NODULATION",
    activity_code: "ACT_CHICKPEA_WEEDING",
    activity_title: "Inter-Cultivation & Hand Weeding (25-30 DAS)",
    activity_category: "INSPECTION",
    earliest_day_offset: 25,
    target_day_offset: 28,
    latest_day_offset: 32,
    priority: "MEDIUM",
    is_weather_sensitive: false,
    guidance_notes:
      "Perform one hand hoeing/weeding at 25-30 DAS. Loosens surface soil, creates soil mulch, and keeps crop weed-free during early vegetative flush (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_PRE_FLOWER",
    activity_code: "ACT_CHICKPEA_IRRIG_PREFLOWER",
    activity_title: "Pre-Flowering Light Irrigation",
    activity_category: "IRRIGATION",
    earliest_day_offset: 40,
    target_day_offset: 45,
    latest_day_offset: 50,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_IRRIG_RAIN_48H",
    guidance_notes:
      "Apply light irrigation at pre-flowering branch initiation. Strictly avoid flood irrigation at flowering stage as it causes flower drop and vegetative overgrowth (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_POD_DEV",
    activity_code: "ACT_CHICKPEA_PODBORER_MON",
    activity_title: "Helicoverpa Pod Borer Pheromone Trap Monitoring",
    activity_category: "PROTECTION",
    earliest_day_offset: 70,
    target_day_offset: 72,
    latest_day_offset: 78,
    priority: "CRITICAL",
    is_weather_sensitive: true,
    weather_sensitivity_type: "SUNNY_WINDOW_REQUIRED",
    guidance_notes:
      "Install pheromone traps @ 5 traps/ha. Economic Threshold Level (ETL): 1-2 larvae per meter row length or 5 moths/trap/day for 3 consecutive days (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_POD_DEV",
    activity_code: "ACT_CHICKPEA_IRRIG_POD",
    activity_title: "Critical Irrigation at Pod Filling",
    activity_category: "IRRIGATION",
    earliest_day_offset: 80,
    target_day_offset: 82,
    latest_day_offset: 88,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_IRRIG_RAIN_48H",
    guidance_notes:
      "Crucial for bold seed filling. Apply light irrigation. If unseasonal rainfall occurs, skip this irrigation immediately to avoid root asphyxiation (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_HARVEST",
    activity_code: "ACT_CHICKPEA_HARVEST",
    activity_title: "Chickpea Crop Harvesting & Field Stacking",
    activity_category: "HARVEST",
    earliest_day_offset: 115,
    target_day_offset: 118,
    latest_day_offset: 125,
    priority: "CRITICAL",
    is_weather_sensitive: true,
    weather_sensitivity_type: "RAIN_AVOIDANCE",
    default_rule_id: "RULE_HARVEST_RAIN_72H",
    guidance_notes:
      "Harvest when leaves turn straw-yellow and shake test reveals rattling seeds. Cut at ground level; dry in field heaps for 3-4 days (ICAR-IIPR).",
  },
  {
    crop_code: "CHICKPEA_DESI",
    stage_code: "STAGE_CHICKPEA_POST_HARVEST",
    activity_code: "ACT_CHICKPEA_STORAGE",
    activity_title: "Threshing, Sun Drying to 9% Moisture & Storage",
    activity_category: "POST_HARVEST",
    earliest_day_offset: 125,
    target_day_offset: 127,
    latest_day_offset: 130,
    priority: "HIGH",
    is_weather_sensitive: true,
    weather_sensitivity_type: "SUNNY_WINDOW_REQUIRED",
    guidance_notes:
      "Thresh and clean seeds. Sun dry until seed moisture drops to 9-10%. Store in moisture-proof bags with neem seed kernel powder (NSKP) at 20 g/kg to protect against bruchids (ICAR-CIPHET).",
  },
];
