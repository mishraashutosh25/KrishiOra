import api from "./api";
import type {
  CropKnowledge,
  CropVariety,
  CropStageTemplate,
  CropCycle,
  CropProgressResponse,
  CreateCropCyclePayload,
} from "../types/lifecycle.types";

export interface CropSummary {
  id: string;
  name: string;
  variety?: string;
  farm_id: string;
  sowing_date: string;
  current_stage?: string;
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
}

export const cropService = {
  /**
   * Get all active crop knowledge entries (ICAR Master Catalog)
   */
  async getKnowledgeCatalog(seasonCategory?: string): Promise<CropKnowledge[]> {
    const params = seasonCategory ? { season: seasonCategory } : {};
    const res = await api.get("/crop-knowledge", { params });
    return res.data?.data || res.data || [];
  },

  /**
   * Get varieties for a specific crop
   */
  async getVarieties(cropId: string): Promise<CropVariety[]> {
    const res = await api.get(`/crop-knowledge/${cropId}/varieties`);
    return res.data?.data || res.data || [];
  },

  /**
   * Get stage templates for a specific crop
   */
  async getStageTemplates(cropId: string): Promise<CropStageTemplate[]> {
    const res = await api.get(`/crop-knowledge/${cropId}/stages`);
    return res.data?.data || res.data || [];
  },

  /**
   * Get all active crop cycles for the current farmer
   */
  async getActiveCycles(farmId?: string): Promise<CropCycle[]> {
    const params = farmId ? { farm_id: farmId } : {};
    const res = await api.get("/lifecycles/active", { params });
    return res.data?.data || res.data || [];
  },

  /**
   * Create a new crop cycle
   */
  async createCycle(payload: CreateCropCyclePayload): Promise<CropCycle> {
    const res = await api.post("/lifecycles/sow", payload);
    return res.data?.data || res.data;
  },

  /**
   * Get comprehensive cycle progress & timeline
   */
  async getCycleProgress(cycleId: string): Promise<CropProgressResponse> {
    const res = await api.get(`/lifecycles/${cycleId}/progress`);
    return res.data?.data || res.data;
  },
};

export default cropService;
