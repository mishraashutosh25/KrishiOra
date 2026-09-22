import { useState, useEffect, useCallback } from "react";
import lifecycleService from "../services/lifecycle.service";
import cropService from "../services/crop.service";
import type {
  CropCycle,
  CropKnowledge,
  CreateCropCyclePayload,
} from "../types/lifecycle.types";

export const useCrops = (farmId?: string) => {
  const [cycles, setCycles] = useState<CropCycle[]>([]);
  const [catalog, setCatalog] = useState<CropKnowledge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [activeCycles, masterCatalog] = await Promise.all([
        lifecycleService.getActiveCycles(farmId).catch(() => []),
        cropService.getKnowledgeCatalog().catch(() => []),
      ]);
      setCycles(activeCycles);
      setCatalog(masterCatalog);
    } catch (err: any) {
      const msg = err?.message || "Failed to load crops data";
      setError(msg);
      console.error("useCrops Error:", err);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const sowCrop = async (payload: CreateCropCyclePayload): Promise<CropCycle> => {
    const result = await lifecycleService.generateCycle(payload);
    const newCycle = result.cycle;
    setCycles((prev) => [newCycle, ...prev]);
    return newCycle;
  };

  return {
    cycles,
    catalog,
    loading,
    error,
    refetch: fetchCrops,
    sowCrop,
  };
};

export default useCrops;
