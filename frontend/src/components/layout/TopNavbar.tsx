import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, ExternalLink, User } from "lucide-react";
import authService from "../../services/auth.service";
import profileService, { type FarmerProfile } from "../../services/profile.service";
import NotificationBell from "../notifications/NotificationBell";

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/farms": "Farms & Plots",
  "/crops": "Active Crops",
  "/expenses": "Expense Ledger",
  "/analytics": "Agricultural Analytics",
  "/profile": "Farmer Profile & Settings",
};

export const TopNavbar = ({ onOpenMobileMenu }: TopNavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);

  // Fetch farmer profile for dynamic avatar & name
  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch {
      // Ignore background fetch error
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleProfileUpdate = (e: any) => {
      if (e?.detail) {
        setProfile(e.detail);
      } else {
        fetchProfile();
      }
    };

    window.addEventListener("krishiora_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("krishiora_profile_updated", handleProfileUpdate);
    };
  }, []);

  // Determine current page title
  const currentPath = Object.keys(routeTitles).find((path) =>
    location.pathname.startsWith(path)
  );
  const pageTitle = currentPath ? routeTitles[currentPath] : "KrishiOra Workspace";

  const handleSignOut = async () => {
    await authService.logout();
    navigate("/login");
  };

  const isProfileActive = location.pathname.startsWith("/profile");

  const getInitials = (name?: string) => {
    if (!name) return "K";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left side: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3.5">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open mobile navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 lg:hidden cursor-pointer"
        >
          <Menu size={18} />
        </button>

        {/* Mobile brand (shown only on mobile) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 p-1 border border-green-200/60">
            <img
              src="/krishiora-logo.png"
              alt="KrishiOra Logo"
              className="h-full w-full object-contain"
              width={22}
              height={22}
            />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-950">
            KrishiOra
          </span>
        </div>

        {/* Desktop Page Title */}
        <div className="hidden lg:flex items-center gap-2">
          <h1 className="text-base font-bold tracking-tight text-slate-900">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Profile Link, Public Site Link & Quick Sign Out */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Back to Public Site */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
        >
          <span className="hidden sm:inline">Public Website</span>
          <ExternalLink size={13} />
        </Link>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Direct Farmer Profile Shortcut with Avatar Photo */}
        <Link
          to="/profile"
          aria-label="Farmer Profile Settings"
          title="Farmer Profile & Settings"
          className={`inline-flex items-center gap-2 rounded-xl border p-1 sm:px-2.5 sm:py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 cursor-pointer ${
            isProfileActive
              ? "border-green-600 bg-green-50 text-green-900 font-bold shadow-2xs"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || "Farmer"}
              className="h-7 w-7 rounded-lg object-cover ring-2 ring-emerald-500/40 shadow-xs flex-shrink-0"
            />
          ) : (
            <div
              className={`h-7 w-7 rounded-lg bg-gradient-to-br ${
                profile?.metadata?.avatar_color || "from-green-700 to-emerald-900"
              } flex items-center justify-center text-xs font-black text-white shadow-2xs flex-shrink-0`}
            >
              {profile?.full_name ? getInitials(profile.full_name) : <User size={14} />}
            </div>
          )}

          <span className="hidden md:inline font-bold truncate max-w-[120px]">
            {profile?.full_name?.split(" ")[0] || "Profile"}
          </span>
        </Link>

        {/* Quick Sign Out Action */}
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out from account"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
