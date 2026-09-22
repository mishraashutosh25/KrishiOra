import { useState, useEffect, useCallback } from "react";
import farmService from "../services/farm.service";
import type { Farm, CreateFarmInput } from "../types/farm";

export const useFarms = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await farmService.getFarms();
      setFarms(data);
    } catch (err: any) {
      const msg = err?.message || "Failed to load farms";
      setError(msg);
      console.error("useFarms Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const addFarm = async (input: CreateFarmInput | Record<string, any>): Promise<Farm> => {
    const newFarm = await farmService.createFarm(input);
    setFarms((prev) => [newFarm, ...prev]);
    return newFarm;
  };

  return {
    farms,
    loading,
    error,
    refetch: fetchFarms,
    addFarm,
  };
};

export default useFarms;
