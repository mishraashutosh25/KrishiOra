import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { createClient } from "@supabase/supabase-js";


const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export const createCrop = async (
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

        const { farmId } = req.params;

        if (!farmId) {
            return res.status(400).json({
                success: false,
                message: "Farm ID is required",
            });
        }

        const {
            crop_name,
            crop_type,
            sowing_date,
            expected_harvest_date,
            area,
            area_unit,
            status,
        } = req.body;

        // Required field
        if (!crop_name) {
            return res.status(400).json({
                success: false,
                message: "Crop name is required",
            });
        }

        // Validate area
        if (area !== undefined) {
            if (typeof area !== "number" || area <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Area must be a positive number",
                });
            }
        }

        // Check whether farm belongs to logged-in user
        const {
            data: farm,
            error: farmError,
        } = await supabaseAdmin
            .from("farms")
            .select("id")
            .eq("id", farmId)
            .eq("user_id", userId)
            .maybeSingle();

        if (farmError) {
            console.error("CHECK FARM ERROR:", farmError);

            return res.status(500).json({
                success: false,
                message: "Failed to verify farm",
            });
        }

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found or you don't have access to it",
            });
        }

        // Create crop
        const {
    data: crop,
    error: cropError,
} = await supabaseAdmin
    .from("crops")
    .insert({
        farm_id: farmId,
        user_id: userId,
        crop_name,
        crop_type,
        sowing_date,
        expected_harvest_date,
        area,
        status: status || "Growing",
    })
    .select()
    .single();

        if (cropError) {
            console.error("CREATE CROP ERROR:", cropError);

            return res.status(500).json({
                success: false,
                message: "Failed to create crop",
                error: cropError.message,
                code: cropError.code,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Crop created successfully",
            crop,
        });

    } catch (error) {
        console.error("CREATE CROP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create crop",
        });
    }
};

export const getCropsByFarm = async (
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

        const { farmId } = req.params;

        if (!farmId) {
            return res.status(400).json({
                success: false,
                message: "Farm ID is required",
            });
        }

        // Check whether farm belongs to logged-in user
        const { data: farm, error: farmError } = await supabaseAdmin
            .from("farms")
            .select("id")
            .eq("id", farmId)
            .eq("user_id", userId)
            .maybeSingle();

        if (farmError) {
            console.error("CHECK FARM ERROR:", farmError);

            return res.status(500).json({
                success: false,
                message: "Failed to verify farm",
            });
        }

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found or you don't have access to it",
            });
        }

        // Get all crops of this farm
        const { data: crops, error: cropError } = await supabaseAdmin
            .from("crops")
            .select("*")
            .eq("farm_id", farmId)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (cropError) {
            console.error("GET CROPS ERROR:", cropError);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch crops",
                error: cropError.message,
                code: cropError.code,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Crops fetched successfully",
            crops,
        });

    } catch (error) {
        console.error("GET CROPS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch crops",
        });
    }
};

export const getCropById = async (
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
                message: "Crop ID is required",
            });
        }

        const { data: crop, error } = await supabaseAdmin
            .from("crops")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            console.error("GET CROP ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch crop",
                error: error.message,
            });
        }

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found or you don't have access to it",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Crop fetched successfully",
            crop,
        });

    } catch (error) {
        console.error("GET CROP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch crop",
        });
    }
};

export const updateCrop = async (
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
                message: "Crop ID is required",
            });
        }

        const {
            crop_name,
            crop_type,
            variety,
            sowing_date,
            expected_harvest_date,
            area,
            status,
        } = req.body;

        // Validate area
        if (area !== undefined) {
            if (typeof area !== "number" || area <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Area must be a positive number",
                });
            }
        }

        // Check crop ownership
        const { data: existingCrop, error: findError } =
            await supabaseAdmin
                .from("crops")
                .select("id")
                .eq("id", id)
                .eq("user_id", userId)
                .maybeSingle();

        if (findError) {
            console.error("CHECK CROP ERROR:", findError);

            return res.status(500).json({
                success: false,
                message: "Failed to verify crop",
            });
        }

        if (!existingCrop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found or you don't have access to it",
            });
        }

        // Build update object
        const updateData: any = {};

        if (crop_name !== undefined) {
            updateData.crop_name = crop_name;
        }

        if (crop_type !== undefined) {
            updateData.crop_type = crop_type;
        }

        if (variety !== undefined) {
            updateData.variety = variety;
        }

        if (sowing_date !== undefined) {
            updateData.sowing_date = sowing_date;
        }

        if (expected_harvest_date !== undefined) {
            updateData.expected_harvest_date = expected_harvest_date;
        }

        if (area !== undefined) {
            updateData.area = area;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update",
            });
        }

        // Update crop
        const { data: crop, error: updateError } =
            await supabaseAdmin
                .from("crops")
                .update(updateData)
                .eq("id", id)
                .eq("user_id", userId)
                .select()
                .single();

        if (updateError) {
            console.error("UPDATE CROP ERROR:", updateError);

            return res.status(500).json({
                success: false,
                message: "Failed to update crop",
                error: updateError.message,
                code: updateError.code,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Crop updated successfully",
            crop,
        });

    } catch (error) {
        console.error("UPDATE CROP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update crop",
        });
    }
};

export const deleteCrop = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        // Check authentication
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const { id } = req.params;

        // Check crop ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Crop ID is required",
            });
        }

        // Check whether crop belongs to logged-in user
        const { data: crop, error: fetchError } = await supabaseAdmin
            .from("crops")
            .select("id, user_id")
            .eq("id", id)
            .eq("user_id", userId)
            .maybeSingle();

        if (fetchError) {
            console.error("CHECK CROP ERROR:", fetchError);

            return res.status(500).json({
                success: false,
                message: "Failed to verify crop",
            });
        }

        // Crop doesn't exist / doesn't belong to user
        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found or you don't have access to it",
            });
        }

        // Delete crop
        const { error: deleteError } = await supabaseAdmin
            .from("crops")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (deleteError) {
            console.error("DELETE CROP ERROR:", deleteError);

            return res.status(500).json({
                success: false,
                message: "Failed to delete crop",
                error: deleteError.message,
                code: deleteError.code,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Crop deleted successfully",
        });

    } catch (error) {
        console.error("DELETE CROP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete crop",
        });
    }
};