/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Authoritative Master Agricultural Knowledge Catalog Aggregator
 * ============================================================================
 */

import { CompleteCropKnowledge } from "../../types/cropKnowledge.types";
import {
  WHEAT_CROP_RECORD,
  WHEAT_VARIETIES,
  WHEAT_STAGE_TEMPLATES,
  WHEAT_ACTIVITY_TEMPLATES,
} from "./wheatKnowledge";
import {
  MUSTARD_CROP_RECORD,
  MUSTARD_VARIETIES,
  MUSTARD_STAGE_TEMPLATES,
  MUSTARD_ACTIVITY_TEMPLATES,
} from "./mustardKnowledge";
import {
  CHICKPEA_CROP_RECORD,
  CHICKPEA_VARIETIES,
  CHICKPEA_STAGE_TEMPLATES,
  CHICKPEA_ACTIVITY_TEMPLATES,
} from "./chickpeaKnowledge";
import {
  ACTIVE_AGRICULTURAL_RULES,
  HISTORICAL_RULE_VERSIONS,
} from "./agriculturalRules";

export const WHEAT_KNOWLEDGE: CompleteCropKnowledge = {
  crop: WHEAT_CROP_RECORD,
  varieties: WHEAT_VARIETIES,
  stages: WHEAT_STAGE_TEMPLATES,
  activities: WHEAT_ACTIVITY_TEMPLATES,
};

export const MUSTARD_KNOWLEDGE: CompleteCropKnowledge = {
  crop: MUSTARD_CROP_RECORD,
  varieties: MUSTARD_VARIETIES,
  stages: MUSTARD_STAGE_TEMPLATES,
  activities: MUSTARD_ACTIVITY_TEMPLATES,
};

export const CHICKPEA_KNOWLEDGE: CompleteCropKnowledge = {
  crop: CHICKPEA_CROP_RECORD,
  varieties: CHICKPEA_VARIETIES,
  stages: CHICKPEA_STAGE_TEMPLATES,
  activities: CHICKPEA_ACTIVITY_TEMPLATES,
};

export const ALL_CROPS_KNOWLEDGE: CompleteCropKnowledge[] = [
  WHEAT_KNOWLEDGE,
  MUSTARD_KNOWLEDGE,
  CHICKPEA_KNOWLEDGE,
];

export {
  WHEAT_CROP_RECORD,
  WHEAT_VARIETIES,
  WHEAT_STAGE_TEMPLATES,
  WHEAT_ACTIVITY_TEMPLATES,
  MUSTARD_CROP_RECORD,
  MUSTARD_VARIETIES,
  MUSTARD_STAGE_TEMPLATES,
  MUSTARD_ACTIVITY_TEMPLATES,
  CHICKPEA_CROP_RECORD,
  CHICKPEA_VARIETIES,
  CHICKPEA_STAGE_TEMPLATES,
  CHICKPEA_ACTIVITY_TEMPLATES,
  ACTIVE_AGRICULTURAL_RULES,
  HISTORICAL_RULE_VERSIONS,
};
