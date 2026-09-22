export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  state?: string;
  avatarUrl?: string;
  role?: "farmer" | "agronomist" | "admin";
  preferredLanguage?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  state: string;
}

export interface VerifyEmailPayload {
  email: string;
  token: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email?: string;
  } | null;
  session?: {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    expires_at?: number;
    user?: unknown;
  } | null;
  data?: T;
}
