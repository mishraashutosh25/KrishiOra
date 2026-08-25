import { supabase } from "../config/supabase";


export const getGoogleOAuthUrl = async () => {
  const callbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/auth/google/callback";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",

    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.url;
};

export const getUserFromToken = async (token: string) => {

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Invalid or expired token");
  }

  return user;
};


