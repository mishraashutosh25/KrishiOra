import api from "./api";
import type { Farm, CreateFarmInput } from "../types/farm";

export const farmService = {
  async getFarms(): Promise<Farm[]> {
    const res = await api.get<{ success: boolean; data: any[] }>("/farms");
    const raw = res.data.data || [];
    return raw.map((f) => ({
      id: f.id,
      name: f.farm_name || f.name || "Farm Plot",
      location: f.location || "",
      state: f.state || "Punjab",
      district: f.district || "",
      areaAcres: Number(f.area || f.areaAcres || f.total_area_acres || 5),
      soilType: f.soil_type || f.soilType || "Black Alluvial",
      irrigationType: f.irrigation_type || f.irrigationType || "Canal / Borewell",
      totalCropsCount: f.totalCropsCount || 0,
      totalExpenses: f.totalExpenses || 0,
      status: f.status || "active",
      establishedYear: f.establishedYear || 2024,
      createdAt: f.created_at || f.createdAt || new Date().toISOString(),
    }));
  },

  async getFarmById(id: string): Promise<Farm> {
    const res = await api.get<{ success: boolean; data: any }>(`/farms/${id}`);
    const f = res.data.data;
    return {
      id: f.id,
      name: f.farm_name || f.name || "Farm Plot",
      location: f.location || "",
      state: f.state || "Punjab",
      district: f.district || "",
      areaAcres: Number(f.area || f.areaAcres || 5),
      soilType: f.soil_type || f.soilType || "Black Alluvial",
      irrigationType: f.irrigation_type || f.irrigationType || "Canal / Borewell",
      totalCropsCount: f.totalCropsCount || 0,
      totalExpenses: f.totalExpenses || 0,
      status: f.status || "active",
      establishedYear: f.establishedYear || 2024,
      createdAt: f.created_at || f.createdAt || new Date().toISOString(),
    };
  },

  async createFarm(input: CreateFarmInput | Record<string, any>): Promise<Farm> {
    const payload = {
      farm_name: (input as any).farm_name || input.name || "Farm Plot",
      location: input.location || "Punjab, India",
      area: Number((input as any).area || input.areaAcres || 5),
      area_unit: (input as any).area_unit || "acre",
      soil_type: (input as any).soil_type || input.soilType || "Alluvial",
      irrigation_type: (input as any).irrigation_type || input.irrigationType || "Canal / Borewell",
      ownership_type: (input as any).ownership_type || "owned",
    };
    const res = await api.post<{ success: boolean; data?: any; farm?: any }>("/farms", payload);
    const f = res.data.data || res.data.farm || {};
    return {
      id: f.id || "",
      name: f.farm_name || f.name || "Farm Plot",
      location: f.location || "",
      state: f.state || "Punjab",
      district: f.district || "",
      areaAcres: Number(f.area || f.areaAcres || 5),
      soilType: f.soil_type || f.soilType || "Black Alluvial",
      irrigationType: f.irrigation_type || f.irrigationType || "Canal / Borewell",
      totalCropsCount: 0,
      totalExpenses: 0,
      status: "active",
      establishedYear: 2024,
      createdAt: f.created_at || new Date().toISOString(),
    };
  },
};

export default farmService;

