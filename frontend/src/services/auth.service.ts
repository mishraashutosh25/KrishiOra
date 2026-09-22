import api from "./api";
import type { LoginPayload, SignupPayload, VerifyEmailPayload, ResendOtpPayload, AuthResponse, User } from "../types/auth";

const TOKEN_KEY = "krishiora_token";
const USER_KEY = "krishiora_user";

export const authService = {
  /**
   * Register a new farmer account.
   * Sends email, password, full_name, phone, and state to the backend.
   * Backend stores phone and state in Supabase user_metadata for retrieval after verification.
   */
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/signup", {
      email: payload.email.trim(),
      password: payload.password,
      full_name: payload.full_name.trim(),
      phone: payload.phone.trim(),
      state: payload.state.trim(),
    });
    return response.data;
  },

  /**
   * Verify email using the 6-digit OTP received in inbox.
   * The backend uses Supabase verifyOtp({ type: "email" }).
   * On success, the backend returns a session that we use to write phone/state to profiles table.
   */
  async verifyEmail(payload: VerifyEmailPayload, profileData?: { phone: string; state: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/verify-email", {
      email: payload.email.trim(),
      token: payload.token.trim(),
    });

    const data = response.data;

    // After successful verification, use the returned session to persist phone/address in profiles table
    if (data.success && data.session?.access_token && profileData) {
      try {
        await api.put(
          "/profile",
          {
            phone: profileData.phone,
            address: profileData.state, // profiles table uses "address" column for state
          },
          {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          }
        );
      } catch {
        // Profile update failure is non-fatal — user can update via profile settings later
        // We deliberately do not surface this error to avoid blocking login flow
      }
    }

    return data;
  },

  /**
   * Resend OTP to the given email address.
   * Backend uses Supabase resend({ type: "signup" }).
   */
  async resendOtp(payload: ResendOtpPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/resend-otp", {
      email: payload.email.trim(),
    });
    return response.data;
  },

  /**
   * Request a password reset OTP via email.
   */
  async forgotPassword(payload: { email: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/forgot-password", {
      email: payload.email.trim(),
    });
    return response.data;
  },

  /**
   * Verify the password reset OTP.
   */
  async verifyResetOtp(payload: { email: string; otp: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/verify-reset-otp", {
      email: payload.email.trim(),
      otp: payload.otp.trim(),
    });
    return response.data;
  },

  /**
   * Resend the password reset OTP (60s cooldown enforced by backend).
   */
  async resendResetOtp(payload: { email: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/resend-reset-otp", {
      email: payload.email.trim(),
    });
    return response.data;
  },

  /**
   * Reset the password after OTP verification.
   * Backend requires newPassword >= 8 characters.
   */
  async resetPassword(payload: { email: string; newPassword: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/reset-password", {
      email: payload.email.trim(),
      newPassword: payload.newPassword,
    });
    return response.data;
  },

  /**
   * Log in with email and password.
   * Stores the session token on success.
   */
  async login(credentials: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", {
      email: credentials.email.trim(),
      password: credentials.password,
    });

    const data = response.data;

    if (data.success && data.session?.access_token) {
      this.setSession(data.session.access_token, data.user || null);
    }

    return data;
  },

  /**
   * Initiate Google OAuth sign-in flow via backend redirect.
   */
  loginWithGoogle(): void {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.href = `${apiUrl}/auth/google`;
  },

  /**
   * Log out the current user and revoke token.
   * Always clears local session even if backend call fails.
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await api.post("/auth/logout");
      }
    } catch {
      // Ignore backend logout error if session already expired
    } finally {
      this.clearSession();
    }
  },

  /**
   * Store token and user information in local storage.
   */
  setSession(token: string, user: Partial<User> | null): void {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Clear session from local storage.
   */
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Retrieve active JWT token.
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Retrieve cached user details.
   */
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  /**
   * Check whether an active token exists.
   */
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};

export default authService;
