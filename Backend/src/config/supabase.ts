import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { Request, Response } from "express";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;

const supabasePublishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY;

const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is missing in .env");
}

if (!supabasePublishableKey) {
    throw new Error(
        "SUPABASE_PUBLISHABLE_KEY is missing in .env"
    );
}

if (!supabaseServiceRoleKey) {
    throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is missing in .env"
    );
}

// Normal Supabase client
export const supabase = createClient(
    supabaseUrl,
    supabasePublishableKey
);

// Backend admin client
export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Server-side Supabase client
export const createSupabaseServerClient = (
    req: Request,
    res: Response
) => {
    return createServerClient(
        supabaseUrl,
        supabasePublishableKey,
        {
            cookies: {
                getAll() {
                    return Object.entries(
                        req.cookies || {}
                    ).map(([name, value]) => ({
                        name,
                        value: String(value)
                    }));
                },

                setAll(cookiesToSet) {
                    if (res.headersSent) {
                        return;
                    }

                    cookiesToSet.forEach(
                        ({ name, value, options }) => {
                            res.cookie(
                                name,
                                value,
                                {
                                    ...options,
                                    httpOnly:
                                        options?.httpOnly ?? true,
                                    secure:
                                        process.env.NODE_ENV ===
                                        "production",
                                    sameSite:
                                        options?.sameSite ?? "lax"
                                }
                            );
                        }
                    );
                }
            }
        }
    );
};

// export const supabaseAdmin = createClient(
//     supabaseUrl,
//     supabaseServiceRoleKey,
//     {
//         auth: {
//             autoRefreshToken: false,
//             persistSession: false
//         }
//     }
// );