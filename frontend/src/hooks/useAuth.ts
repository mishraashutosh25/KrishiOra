import { useState, useCallback } from "react";
import authService from "../services/auth.service";
import type { User, LoginPayload, SignupPayload, VerifyEmailPayload, ResendOtpPayload, AuthResponse } from "../types/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = useCallback(async (credentials: LoginPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(authService.getToken());
      setUser(authService.getCurrentUser());
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (payload: SignupPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.signup(payload);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (
    payload: VerifyEmailPayload,
    profileData?: { phone: string; state: string }
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(payload, profileData);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendOtp = useCallback(async (payload: ResendOtpPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.resendOtp(payload);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback((): void => {
    setIsLoading(true);
    authService.loginWithGoogle();
  }, []);

  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    loginWithGoogle,
    signup,
    verifyEmail,
    resendOtp,
    logout,
  };
};

export default useAuth;
