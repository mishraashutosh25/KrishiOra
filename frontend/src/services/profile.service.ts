import api from "./api";

export interface FarmerIdentityMetadata {
  farmer_scale?: "Marginal (< 2.5 Acres)" | "Small (2.5 - 5 Acres)" | "Medium (5 - 10 Acres)" | "Large (> 10 Acres)";
  pm_kisan_id?: string;
  kcc_holder?: boolean;
  kcc_limit_inr?: number;
  soil_health_card_no?: string;
  pmfby_insured?: boolean;
}

export interface FarmDiagnosticsMetadata {
  landholding_acres?: number;
  ownership_type?: "Self-Owned" | "Leased / Theka" | "Sharecropper / Batai";
  soil_type?: string;
  soil_ph?: number;
  irrigation_type?: string;
  water_source?: string;
}

export interface MandiPreferencesMetadata {
  primary_mandi?: string;
  distance_km?: number;
  target_commodities?: string[];
  min_wheat_target_rate?: number;
}

export interface WeatherPreferencesMetadata {
  rain_alert_threshold_mm?: number;
  wind_alert_threshold_kmh?: number;
  sms_alerts?: boolean;
  whatsapp_alerts?: boolean;
}

export interface FarmerMetadata {
  identity?: FarmerIdentityMetadata;
  farm_diagnostics?: FarmDiagnosticsMetadata;
  mechanization?: string[];
  mandi_preferences?: MandiPreferencesMetadata;
  weather_preferences?: WeatherPreferencesMetadata;
  avatar_color?: string;
  state?: string;
  district?: string;
  village?: string;
}

export interface FarmerProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  language?: string;
  avatar_url?: string;
  created_at?: string;
  last_sign_in_at?: string;
  farm?: {
    id?: string;
    farm_name?: string;
    area?: number;
    area_unit?: string;
    soil_type?: string;
    irrigation_type?: string;
    ownership_type?: string;
    location?: string;
  };
  metadata?: FarmerMetadata;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
  address?: string;
  language?: string;
  avatar_url?: string;
  farm?: {
    farm_name?: string;
    area?: number;
    area_unit?: string;
    soil_type?: string;
    irrigation_type?: string;
    ownership_type?: string;
    location?: string;
  };
  metadata?: FarmerMetadata;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  /**
   * Fetches the authenticated farmer's unified profile
   */
  async getProfile(): Promise<FarmerProfile> {
    const res = await api.get<{ success: boolean; profile: FarmerProfile }>("/profile");
    return res.data.profile;
  },

  /**
   * Updates farmer profile attributes and synchronized farm data
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<FarmerProfile> {
    const res = await api.put<{ success: boolean; message: string; profile: FarmerProfile }>(
      "/profile",
      payload
    );
    return res.data.profile;
  },

  /**
   * Changes authenticated farmer's account password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    const res = await api.post<{ success: boolean; message: string }>(
      "/auth/change-password",
      payload
    );
    return res.data;
  },

  /**
   * Deletes the user account permanently
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>("/profile");
    return res.data;
  },
};

export default profileService;
