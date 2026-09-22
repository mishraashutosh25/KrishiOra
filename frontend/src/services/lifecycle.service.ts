import api from "./api";
import type {
  CropCycle,
  CropKnowledge,
  CropVariety,
  CropProgressResponse,
  FarmTask,
  GenerateCycleInput,
} from "../types/lifecycle.types";

export const lifecycleService = {
  // 1. Get agricultural knowledge catalog
  async getCropCatalog(): Promise<CropKnowledge[]> {
    const res = await api.get<{ success: boolean; data: CropKnowledge[] }>("/crop-knowledge/crops");
    return res.data.data || [];
  },

  // 2. Get varieties for a specific crop
  async getVarieties(cropCode: string): Promise<CropVariety[]> {
    const res = await api.get<{ success: boolean; data: CropVariety[] }>(`/crop-knowledge/crops/${cropCode}/varieties`);
    return res.data.data || [];
  },

  // 3. Get active crop cycles for the logged-in farmer
  async getActiveCycles(farmId?: string): Promise<CropCycle[]> {
    const params = farmId ? { farmId } : {};
    const res = await api.get<{ success: boolean; data: CropCycle[] }>("/lifecycles", { params });
    return res.data.data || [];
  },

  // 4. Generate a new crop cycle
  async generateCycle(input: GenerateCycleInput): Promise<{ cycle: CropCycle; stagesCount: number; tasksCount: number }> {
    const payload = {
      farmId: input.farm_id,
      cropCode: input.crop_code,
      varietyCode: input.variety_code,
      sowingDate: input.sowing_date,
      allocatedArea: Number(input.allocated_area),
      areaUnit: input.area_unit || "acre",
      soilType: input.soil_type,
      irrigationType: input.irrigation_type,
      notes: input.notes,
    };
    const res = await api.post<{ success: boolean; data: any }>("/lifecycles", payload);
    return res.data.data;
  },

  // 5. Get cycle progress and stage progression
  async getCycleProgress(cycleId: string): Promise<CropProgressResponse> {
    const res = await api.get<{ success: boolean; data: CropProgressResponse }>(`/lifecycles/${cycleId}/progress`);
    return res.data.data;
  },

  // 6. Get tasks for a crop cycle
  async getCycleTasks(cycleId: string): Promise<FarmTask[]> {
    const res = await api.get<{ success: boolean; data: FarmTask[] }>(`/lifecycles/${cycleId}/tasks`);
    return res.data.data || [];
  },
};

export default lifecycleService;

