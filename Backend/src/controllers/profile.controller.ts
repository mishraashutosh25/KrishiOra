import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const getProfile = async (
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

        // 1. Fetch user from Supabase Auth to get verified email
        const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const userEmail = authUserData?.user?.email || "";
        const userMetadata = authUserData?.user?.user_metadata || {};

        // 2. Fetch profile from profiles table
        let { data, error } = await supabaseUser
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.error("GET PROFILE DATABASE ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get profile",
                error: error.message,
                code: error.code,
            });
        }

        // 3. Auto-provision default profile row if not found
        if (!data) {
            const initialName = userMetadata.full_name || userMetadata.name || userEmail.split("@")[0] || "Farmer";
            const { data: newProfile, error: insertError } = await supabaseAdmin
                .from("profiles")
                .insert([
                    {
                        id: userId,
                        full_name: initialName,
                        phone: userMetadata.phone || "",
                        address: userMetadata.address || "Punjab, India",
                        language: "hi",
                        updated_at: new Date().toISOString(),
                    },
                ])
                .select("*")
                .single();

            if (!insertError && newProfile) {
                data = newProfile;
            } else {
                data = {
                    id: userId,
                    full_name: initialName,
                    phone: "",
                    address: "Punjab, India",
                    language: "hi",
                };
            }
        }

        // 4. Fetch Primary Farm from farms table
        let farmData: any = null;
        try {
            const { data: farm } = await supabaseUser
                .from("farms")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            farmData = farm;
        } catch (fErr) {
            console.warn("FARM LOOKUP WARNING:", fErr);
        }

        // If no farm exists, auto-provision default 5-acre farm
        if (!farmData) {
            try {
                const { data: createdFarm } = await supabaseAdmin
                    .from("farms")
                    .insert({
                        user_id: userId,
                        farm_name: `${data.full_name || 'My'} Main Farm`,
                        location: data.address || "Ludhiana, Punjab",
                        area: 5,
                        area_unit: "acres",
                        soil_type: "Alluvial Soil",
                        irrigation_type: "Tube-well / Borewell",
                        ownership_type: "Self-Owned",
                    })
                    .select("*")
                    .single();
                farmData = createdFarm;
            } catch (createFarmErr) {
                console.warn("AUTO CREATE FARM FALLBACK:", createFarmErr);
            }
        }

        // Parse address / metadata if serialized
        let parsedMetadata: any = {};
        if (data.metadata && typeof data.metadata === "object") {
            parsedMetadata = data.metadata;
        } else if (typeof data.metadata === "string") {
            try {
                parsedMetadata = JSON.parse(data.metadata);
            } catch {}
        }

        return res.status(200).json({
            success: true,
            profile: {
                ...data,
                email: userEmail,
                last_sign_in_at: authUserData?.user?.last_sign_in_at,
                created_at: data.created_at || authUserData?.user?.created_at,
                farm: farmData,
                metadata: parsedMetadata,
            },
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get profile",
        });
    }
};

export const updateProfile = async (
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

        const body = req.body ?? {};
        const {
            full_name,
            phone,
            address,
            language,
            avatar_url,
            metadata,
            farm,
        } = body;

        // 1. Prepare profile updates
        const profileUpdates: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (full_name !== undefined) profileUpdates.full_name = full_name;
        if (phone !== undefined) profileUpdates.phone = phone;
        if (address !== undefined) profileUpdates.address = address;
        if (language !== undefined) profileUpdates.language = language;
        if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url;
        if (metadata !== undefined) profileUpdates.metadata = metadata;

        let { data, error } = await supabaseUser
            .from("profiles")
            .update(profileUpdates)
            .eq("id", userId)
            .select("*")
            .single();

        // If error might be due to missing 'metadata' column, retry without metadata
        if (error && error.message?.includes("metadata")) {
            delete profileUpdates.metadata;
            const retry = await supabaseUser
                .from("profiles")
                .update(profileUpdates)
                .eq("id", userId)
                .select("*")
                .single();
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            console.error("UPDATE PROFILE DATABASE ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update profile",
                error: error.message,
            });
        }

        // 2. Synchronize Farm Attributes if provided
        let updatedFarm: any = null;
        if (farm && typeof farm === "object") {
            try {
                const { data: existingFarm } = await supabaseUser
                    .from("farms")
                    .select("id")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                const farmPayload = {
                    farm_name: farm.farm_name || `${full_name || 'My'} Main Farm`,
                    location: farm.location || address || "Ludhiana, Punjab",
                    area: Number(farm.area) || 5,
                    area_unit: farm.area_unit || "acres",
                    soil_type: farm.soil_type || "Alluvial Soil",
                    irrigation_type: farm.irrigation_type || "Tube-well / Borewell",
                    ownership_type: farm.ownership_type || "Self-Owned",
                };

                if (existingFarm?.id) {
                    const { data: uFarm } = await supabaseUser
                        .from("farms")
                        .update(farmPayload)
                        .eq("id", existingFarm.id)
                        .select("*")
                        .single();
                    updatedFarm = uFarm;
                } else {
                    const { data: cFarm } = await supabaseAdmin
                        .from("farms")
                        .insert({
                            ...farmPayload,
                            user_id: userId,
                        })
                        .select("*")
                        .single();
                    updatedFarm = cFarm;
                }
            } catch (fUpdateErr) {
                console.warn("FARM SYNC UPDATE ERROR:", fUpdateErr);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Profile and agricultural settings updated successfully",
            profile: {
                ...data,
                farm: updatedFarm,
                metadata: metadata || data?.metadata || {},
            },
        });

    } catch (error: any) {
        console.error("UPDATE PROFILE CATCH ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error?.message || "Unknown error",
        });
    }
};

export const deleteProfile = async (
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

        // Delete from profiles
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", userId);

        if (profileError) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete user profile data",
                error: profileError.message,
            });
        }

        // Delete user in auth admin
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete auth user account",
                error: authError.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Account deleted permanently",
        });

    } catch (error) {
        console.error("DELETE PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete account",
        });
    }
};