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

        const { data, error } = await supabaseUser
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

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            profile: data,
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
        // 1. Get authenticated user
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        // 2. Get authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing",
            });
        }

        // 3. Extract token
        const token = authHeader.split(" ")[1];

        // 4. Create Supabase client with user's token
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

        // 5. Safely read request body
        const body = req.body ?? {};

        console.log("UPDATE PROFILE BODY:", body);
        console.log("UPDATE PROFILE USER ID:", userId);

        const {
            full_name,
            phone,
            address,
            language,
        } = body;

        // 6. Prepare only fields that were sent
        const updates: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (full_name !== undefined) {
            updates.full_name = full_name;
        }

        if (phone !== undefined) {
            updates.phone = phone;
        }

        if (address !== undefined) {
            updates.address = address;
        }

        if (language !== undefined) {
            updates.language = language;
        }

        console.log("PROFILE UPDATES:", updates);

        // 7. Update user's own profile
        const { data, error } = await supabaseUser
            .from("profiles")
            .update(updates)
            .eq("id", userId)
            .select("*")
            .single();

        // 8. Database error
        if (error) {
            console.error("UPDATE PROFILE DATABASE ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to update profile",
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            });
        }

        // 9. Success
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: data,
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

        // Delete user from Supabase Auth
        // Profile should be deleted automatically if
        // profiles.id has ON DELETE CASCADE with auth.users.id
        const { error } =
            await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error("DELETE USER ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to delete profile",
                error: error.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile deleted successfully",
        });
    } catch (error) {
        console.error("DELETE PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete profile",
        });
    }
};