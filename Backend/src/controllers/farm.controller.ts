import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!
);

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const createFarm = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const {
            farm_name,
            location,
            area,
            area_unit,
            soil_type,
            irrigation_type,
            ownership_type,
        } = req.body;

        if (!farm_name || !location || !area) {
            return res.status(400).json({
                success: false,
                message: "Farm name, location and area are required",
            });
        }

        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing",
            });
        }

        const token = authHeader.split(" ")[1];

        const supabaseUser = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            }
        );

        const { data, error } = await supabaseUser
            .from("farms")
            .insert({
                user_id: userId, // ⭐ MOST IMPORTANT
                farm_name,
                location,
                area,
                area_unit,
                soil_type,
                irrigation_type,
                ownership_type,
            })
            .select()
            .single();

        if (error) {
            console.error("CREATE FARM ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create farm",
                error: error.message,
                code: error.code,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Farm created successfully",
            farm: data,
        });

    } catch (error) {
        console.error("CREATE FARM ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create farm",
        });
    }
};

export const getFarms = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing",
            });
        }

        const token = authHeader.split(" ")[1];

        const supabaseUser = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            }
        );

        const { data, error } = await supabaseUser
            .from("farms")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error("GET FARMS ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch farms",
                error: error.message,
                code: error.code,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Farms fetched successfully",
            farms: data,
        });

    } catch (error) {
        console.error("GET FARMS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch farms",
        });
    }
};

export const getFarmById = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Farm ID is required",
            });
        }

        // Get Bearer token
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing",
            });
        }

        const token = authHeader.split(" ")[1];

        // Supabase client with user's JWT
        const supabaseUser = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            }
        );

        const { data, error } = await supabaseUser
            .from("farms")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .maybeSingle();

        console.log("FARM DATA:", data);
        console.log("FARM ERROR:", error);

        if (error) {
            console.error("GET FARM ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch farm",
                error: error.message,
                code: error.code,
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Farm fetched successfully",
            farm: data,
        });

    } catch (error) {
        console.error("GET FARM BY ID ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch farm",
        });
    }
};

export const updateFarm = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Farm ID is required",
            });
        }

        const {
            farm_name,
            location,
            area,
            area_unit,
            soil_type,
            irrigation_type,
            ownership_type,
        } = req.body;

        // At least one field must be provided
        if (
            farm_name === undefined &&
            location === undefined &&
            area === undefined &&
            area_unit === undefined &&
            soil_type === undefined &&
            irrigation_type === undefined &&
            ownership_type === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update",
            });
        }

        // Validate area if provided
        if (area !== undefined) {
            if (typeof area !== "number" || area <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Area must be a positive number",
                });
            }
        }

        // Build update object
        const updateData: any = {};

        if (farm_name !== undefined) {
            updateData.farm_name = farm_name;
        }

        if (location !== undefined) {
            updateData.location = location;
        }

        if (area !== undefined) {
            updateData.area = area;
        }

        if (area_unit !== undefined) {
            updateData.area_unit = area_unit;
        }

        if (soil_type !== undefined) {
            updateData.soil_type = soil_type;
        }

        if (irrigation_type !== undefined) {
            updateData.irrigation_type = irrigation_type;
        }

        if (ownership_type !== undefined) {
            updateData.ownership_type = ownership_type;
        }

        // Update only the logged-in user's farm
        const {
            data: farm,
            error,
        } = await supabaseAdmin
            .from("farms")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("UPDATE FARM ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to update farm",
                error: error.message,
                code: error.code,
            });
        }

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found or you don't have permission to update it",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Farm updated successfully",
            farm,
        });
    } catch (error) {
        console.error("UPDATE FARM ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update farm",
        });
    }
};

export const deleteFarm = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Farm ID is required",
            });
        }

        const { data, error } = await supabaseAdmin
            .from("farms")
            .delete()
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("DELETE FARM ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to delete farm",
                error: error.message,
                code: error.code,
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Farm deleted successfully",
            farm: data,
        });

    } catch (error) {
        console.error("DELETE FARM ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete farm",
        });
    }
};