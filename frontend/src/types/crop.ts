export interface Crop {
  id: string;
  name: string;
  variety: string;
  farmId: string;
  farmName: string;
  areaAcres: number;
  season: "Kharif" | "Rabi" | "Zaid";
  sowingDate: string;
  expectedHarvestDate: string;
  stage: "Sowing" | "Vegetative" | "Flowering" | "Maturity" | "Harvesting";
  stageProgress: number; // 0 - 100%
  healthStatus: "healthy" | "harvest" | "watch" | "danger";
  expectedYieldQuintals: number;
  notes?: string;
  createdAt?: string;
}

export interface CreateCropInput {
  name: string;
  variety: string;
  farmId: string;
  areaAcres: number;
  season: Crop["season"];
  sowingDate: string;
  expectedHarvestDate: string;
  expectedYieldQuintals: number;
}
