export interface Farm {
  id: string;
  name: string;
  location: string;
  state: string;
  district: string;
  areaAcres: number;
  soilType: "Black Alluvial" | "Red Loam" | "Clayey" | "Sandy Loam" | "Laterite";
  irrigationType: "Drip Irrigation" | "Canal / Borewell" | "Sprinkler" | "Rainfed";
  totalCropsCount: number;
  totalExpenses: number;
  status: "active" | "fallow" | "maintenance";
  establishedYear: number;
  notes?: string;
  createdAt: string;
}

export interface CreateFarmInput {
  name: string;
  location: string;
  state: string;
  district: string;
  areaAcres: number;
  soilType: Farm["soilType"];
  irrigationType: Farm["irrigationType"];
  notes?: string;
}
