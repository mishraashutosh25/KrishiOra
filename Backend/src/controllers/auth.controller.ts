import { Request, Response } from "express";
import { createSupabaseServerClient } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import { sendPasswordResetOtpEmail } from "../services/email.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";


const supabaseAuth = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!
);

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const googleLogin = async (
    req: Request,
    res: Response
) => {
    try {
        const supabase = createSupabaseServerClient(req, res);

        const redirectTo =
            process.env.GOOGLE_CALLBACK_URL ||
            "http://localhost:5000/api/auth/google/callback";

        const { data, error } =
            await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo,
                    queryParams: {
                        access_type: "offline",
                        prompt: "select_account",
                    },
                },
            });

        if (error) {
            console.error("Google OAuth Error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Google authentication failed",
                error: error.message,
            });
        }

        if (!data.url) {
            return res.status(500).json({
                success: false,
                message: "Google OAuth URL was not generated",
            });
        }

        return res.redirect(data.url);
    } catch (error) {
        console.error("Google Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Google authentication failed",
        });
    }
};

export const googleCallback = async (
    req: Request,
    res: Response
 ) => {
    try {
        const oauthError = req.query.error;
        const errorDescription = req.query.error_description;

        if (oauthError) {
            const frontendUrl =
                process.env.FRONTEND_URL ||
                "http://localhost:5173";

            return res.redirect(
                `${frontendUrl}/auth/callback?error=${encodeURIComponent(String(oauthError))}&error_description=${encodeURIComponent(String(errorDescription || ""))}`
            );
        }

        const code = req.query.code;

        if (!code || typeof code !== "string") {
            const frontendUrl =
                process.env.FRONTEND_URL ||
                "http://localhost:5173";

            return res.redirect(
                `${frontendUrl}/auth/callback?error=missing_code&error_description=${encodeURIComponent("Authorization code is missing")}`
            );
        }

        const supabase = createSupabaseServerClient(req, res);

        const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error(
                "Exchange Code Error:",
                error.message
            );

            const frontendUrl =
                process.env.FRONTEND_URL ||
                "http://localhost:5173";

            return res.redirect(
                `${frontendUrl}/auth/callback?error=exchange_failed&error_description=${encodeURIComponent(error.message)}`
            );
        }

        if (!data.user || !data.session) {
            const frontendUrl =
                process.env.FRONTEND_URL ||
                "http://localhost:5173";

            return res.redirect(
                `${frontendUrl}/auth/callback?error=no_user&error_description=${encodeURIComponent("User authentication failed")}`
            );
        }

        console.log(
            "Google authentication successful:",
            data.user.email
        );

        const frontendUrl =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";

        // Pass token and user info to frontend via URL params
        const params = new URLSearchParams({
            access_token: data.session.access_token,
            user_id: data.user.id,
            user_email: data.user.email || "",
            user_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
        });

        return res.redirect(
            `${frontendUrl}/auth/callback?${params.toString()}`
        );

    } catch (error) {
        console.error(
            "Google Callback Error:",
            error
        );

        const frontendUrl =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";

        return res.redirect(
            `${frontendUrl}/auth/callback?error=server_error&error_description=${encodeURIComponent("Google authentication callback failed")}`
        );
    }
};

export const emailSignup = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            email,
            password,
            full_name,
            phone,
            state,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const { data, error } =
            await supabaseAuth.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: full_name || null,
                        phone: phone || null,
                        state: state || null,
                    },
                },
            });

        if (error) {
            console.error(
                "EMAIL SIGNUP ERROR:",
                error.message
            );

            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(201).json({
            success: true,
            message:
                "Signup successful. Please check your email for the verification OTP.",
            user: data.user
                ? {
                      id: data.user.id,
                      email: data.user.email,
                  }
                : null,
        });

    } catch (error) {
        console.error(
            "EMAIL SIGNUP SERVER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Signup failed",
        });
    }
};

export const verifyEmailOtp = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            email,
            token,
        } = req.body;

        if (!email || !token) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const { data, error } =
            await supabaseAuth.auth.verifyOtp({
                email,
                token,
                type: "email",
            });

        if (error) {
            console.error(
                "EMAIL OTP ERROR:",
                error.message
            );

            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: data.user
                ? {
                      id: data.user.id,
                      email: data.user.email,
                  }
                : null,
            session: data.session,
        });

    } catch (error) {
        console.error(
            "VERIFY OTP SERVER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Email verification failed",
        });
    }
};

export const emailLogin = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const { data, error } =
            await supabaseAuth.auth.signInWithPassword({
                email,
                password,
            });

        if (error) {
            console.error(
                "EMAIL LOGIN ERROR:",
                error.message
            );

            return res.status(401).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: data.user
                ? {
                      id: data.user.id,
                      email: data.user.email,
                  }
                : null,
            session: data.session,
        });

    } catch (error) {
        console.error(
            "EMAIL LOGIN SERVER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};

export const resendEmailOtp = async (
    req: Request,
    res: Response
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const { error } =
            await supabaseAuth.auth.resend({
                type: "signup",
                email,
            });

        if (error) {
            console.error(
                "RESEND OTP ERROR:",
                error.message
            );

            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Verification OTP has been resent to your email",
        });

    } catch (error) {
        console.error(
            "RESEND OTP SERVER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to resend OTP",
        });
    }
};

export const logout = async (
    req: Request,
    res: Response
 ) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Bearer token required",
            });
        }

        const token = authHeader.split(" ")[1];

        const supabase = createClient(
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

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("LOGOUT ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Logout failed",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};

export const forgotPassword = async (
    req: Request,
    res: Response
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const {
            data: { users },
            error: usersError,
        } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) {
            console.error(
                "FORGOT PASSWORD USER CHECK ERROR:",
                usersError.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to process request",
            });
        }

        const userExists = users.some(
            (user) =>
                user.email?.toLowerCase() === normalizedEmail
        );

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Hash OTP before storing
        const otpHash = await bcrypt.hash(otp, 10);

        // OTP expires in 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        ).toISOString();

        // Remove previous reset OTPs
        const { error: deleteError } = await supabaseAdmin
            .from("password_reset_otps")
            .delete()
            .eq("email", normalizedEmail);

        if (deleteError) {
            console.error(
                "DELETE OLD RESET OTP ERROR:",
                deleteError.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to process OTP",
            });
        }

        // Store new OTP hash
        const { error: insertError } = await supabaseAdmin
            .from("password_reset_otps")
            .insert({
                email: normalizedEmail,
                otp_hash: otpHash,
                expires_at: expiresAt,
            });

        if (insertError) {
            console.error(
                "SAVE RESET OTP ERROR:",
                insertError.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to generate OTP",
            });
        }

        // Send OTP to user's email
        try {
            await sendPasswordResetOtpEmail(
                normalizedEmail,
                otp
            );
        } catch (emailError) {
            console.error(
                "PASSWORD RESET EMAIL ERROR:",
                emailError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to send password reset OTP",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent successfully",
        });

    } catch (error) {
        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to process forgot password request",
        });
    }
};

export const verifyResetOtp = async (
    req: Request,
    res: Response
) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const { data: otpRecord, error } = await supabaseAdmin
            .from("password_reset_otps")
            .select("*")
            .eq("email", email)
            .eq("verified", false)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(
                "VERIFY RESET OTP DATABASE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to verify OTP",
            });
        }

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        // Check OTP expiry
        if (new Date(otpRecord.expires_at) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        // Maximum OTP attempts
        const MAX_OTP_ATTEMPTS =3;

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                message:
                    "Too many incorrect OTP attempts. Please request a new OTP.",
            });
        }

        const isValidOtp = await bcrypt.compare(
            otp.toString(),
            otpRecord.otp_hash
        );

        if (!isValidOtp) {
            await supabaseAdmin
                .from("password_reset_otps")
                .update({
                    attempts: otpRecord.attempts + 1,
                })
                .eq("id", otpRecord.id);

            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        const { error: updateError } = await supabaseAdmin
            .from("password_reset_otps")
            .update({
                verified: true,
            })
            .eq("id", otpRecord.id);

        if (updateError) {
            console.error(
                "VERIFY RESET OTP UPDATE ERROR:",
                updateError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to verify OTP",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });

    } catch (error) {
        console.error(
            "VERIFY RESET OTP ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};

export const resetPassword = async (
    req: Request,
    res: Response
) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        const { data: otpRecord, error: otpError } = await supabaseAdmin
            .from("password_reset_otps")
            .select("*")
            .eq("email", email)
            .eq("verified", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (otpError) {
            console.error(
                "RESET PASSWORD OTP DATABASE ERROR:",
                otpError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to verify reset request",
            });
        }

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Please verify OTP first",
            });
        }

        if (new Date(otpRecord.expires_at) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Password reset OTP has expired",
            });
        }

        const {
            data: userData,
            error: userError,
        } = await supabaseAdmin.auth.admin.listUsers();

        if (userError) {
            console.error(
                "FIND USER ERROR:",
                userError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to find user",
            });
        }

        const user = userData.users.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const {
            error: passwordError,
        } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            {
                password: newPassword,
            }
        );

        if (passwordError) {
            console.error(
                "PASSWORD UPDATE ERROR:",
                passwordError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to reset password",
            });
        }

        // 8. Delete used OTP
        const { error: deleteOtpError } = await supabaseAdmin
            .from("password_reset_otps")
            .delete()
            .eq("id", otpRecord.id);

        if (deleteOtpError) {
            console.error(
                "DELETE RESET OTP ERROR:",
                deleteOtpError
            );
        }

        // 9. Success
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to reset password",
        });
    }
};

export const resendResetOtp = async (
    req: Request,
    res: Response
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find latest OTP
        const { data: latestOtp, error: otpError } =
            await supabaseAdmin
                .from("password_reset_otps")
                .select("*")
                .eq("email", normalizedEmail)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

        if (otpError) {
            console.error(
                "RESEND RESET OTP DATABASE ERROR:",
                otpError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to process resend request",
            });
        }

        // Check if OTP was already generated
        if (!latestOtp) {
            return res.status(400).json({
                success: false,
                message:
                    "Please request a password reset OTP first",
            });
        }

        // 60-second cooldown 
        const cooldown = 60 * 1000;

        const createdAt = new Date(
            latestOtp.created_at
        ).getTime();

        const now = Date.now();

        const timePassed = now - createdAt;

        if (timePassed < cooldown) {
            const remainingSeconds = Math.ceil(
                (cooldown - timePassed) / 1000
            );

            return res.status(429).json({
                success: false,
                message: `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
                retryAfter: remainingSeconds,
            });
        }

        // Generate new OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Hash OTP
        const otpHash = await bcrypt.hash(
            otp,
            10
        );

        // OTP expires in 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        ).toISOString();

        // Delete previous OTP
        const { error: deleteError } =
            await supabaseAdmin
                .from("password_reset_otps")
                .delete()
                .eq("email", normalizedEmail);

        if (deleteError) {
            console.error(
                "DELETE OLD RESET OTP ERROR:",
                deleteError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to resend OTP",
            });
        }

        // Save new OTP
        const { error: insertError } =
            await supabaseAdmin
                .from("password_reset_otps")
                .insert({
                    email: normalizedEmail,
                    otp_hash: otpHash,
                    expires_at: expiresAt,
                    attempts: 0,
                    verified: false,
                });

        if (insertError) {
            console.error(
                "SAVE NEW RESET OTP ERROR:",
                insertError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to generate new OTP",
            });
        }

        // Send new OTP email
        try {
            await sendPasswordResetOtpEmail(
                normalizedEmail,
                otp
            );
        } catch (emailError) {
            console.error(
                "RESEND RESET OTP EMAIL ERROR:",
                emailError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to send new OTP",
            });
        }

        return res.status(200).json({
            success: true,
            message: "New password reset OTP sent successfully",
        });

    } catch (error) {
        console.error(
            "RESEND RESET OTP ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to resend OTP",
        });
    }
};

export const changePassword = async (
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

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required",
            });
        }

        // Minimum 8 characters
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        // Strong password validation
        const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]).{8,}$/;

        if (!strongPasswordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain uppercase, lowercase, number and special character",
            });
        }

        // New password must be different
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password",
            });
        }

        // Get current user's email
        const {
            data: userData,
            error: userError,
        } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (userError || !userData.user?.email) {
            console.error(
                "CHANGE PASSWORD USER ERROR:",
                userError
            );

            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const email = userData.user.email;

        // Verify current password
        const supabaseAuth = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!
        );

        const {
            error: loginError,
        } = await supabaseAuth.auth.signInWithPassword({
            email,
            password: currentPassword,
        });

        if (loginError) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Update password
        const {
            error: passwordError,
        } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            {
                password: newPassword,
            }
        );

        if (passwordError) {
            console.error(
                "CHANGE PASSWORD UPDATE ERROR:",
                passwordError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to change password",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to change password",
        });
    }
};

