import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sprout,
  Receipt,
  BarChart3,
  MapPin,
  LogOut,
  ChevronRight,
  ExternalLink,
  User,
} from "lucide-react";
import authService from "../../services/auth.service";
import profileService, { type FarmerProfile } from "../../services/profile.service";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Farms", href: "/farms", icon: MapPin },
  { label: "Crops", href: "/crops", icon: Sprout },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Farmer Profile", href: "/profile", icon: User },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);

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

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate?.();
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
    <aside
      className="flex h-full w-full flex-col justify-between border-r border-slate-200/80 bg-white"
      aria-label="Application Navigation"
    >
      {/* Top Branding Section */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-green-700"
            aria-label="KrishiOra Dashboard"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 p-1.5 border border-green-200/60 shadow-2xs">
              <img
                src="/krishiora-logo.png"
                alt="KrishiOra Logo"
                className="h-full w-full object-contain"
                width={26}
                height={26}
              />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-950">
                KrishiOra
              </span>
              <span className="block text-[10px] font-semibold text-green-700 uppercase tracking-wider">
                Smart Farming
              </span>
            </div>
          </Link>
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1 p-3" aria-label="Main menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-green-50 text-green-900 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-green-700"
                        : "text-slate-400 group-hover:text-slate-700 transition-colors"
                    }
                  />
                  <span>{item.label}</span>
                </div>

                {isActive && (
                  <ChevronRight size={14} className="text-green-700" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Area & Actions */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        {/* Link back to public landing page */}
        <Link
          to="/"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <span>View Public Website</span>
          <ExternalLink size={13} />
        </Link>

        {/* Interactive User Account Profile Card */}
        <Link
          to="/profile"
          onClick={onNavigate}
          className={`flex items-center justify-between rounded-xl p-2.5 border transition-all cursor-pointer ${
            isProfileActive
              ? "bg-green-50 border-green-300 ring-2 ring-green-600/20 shadow-2xs"
              : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Farmer"}
                className="h-8 w-8 rounded-xl object-cover shadow-2xs ring-1 ring-emerald-500/30 flex-shrink-0"
              />
            ) : (
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${
                  profile?.metadata?.avatar_color || "from-green-700 to-emerald-900"
                } text-xs font-black text-white shadow-2xs`}
              >
                {profile?.full_name ? getInitials(profile.full_name) : <User size={15} />}
              </div>
            )}
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-bold text-slate-900">
                {profile?.full_name || "Farmer Profile"}
              </p>
              <p className="truncate text-[10px] text-green-700 font-semibold">
                Account & Settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign Out"
            title="Sign Out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
