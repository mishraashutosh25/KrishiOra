import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import MobileNav from "./MobileNav";
import KrishiSahayakCopilot from "../copilot/KrishiSahayakCopilot";

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#FAFBF9] text-slate-900 flex flex-col lg:flex-row relative">
      {/* 1. Desktop Sidebar Column (In normal document flow: never overlaps content) */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col sticky top-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* 2. Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* 3. Right Application Area (Spans remaining viewport width naturally) */}
      <div className="flex flex-1 flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <TopNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic Main Content Container */}
        <main
          id="main-content"
          className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto overflow-x-hidden"
        >
          {children || <Outlet />}
        </main>
      </div>

      {/* 4. Floating Krishi Sahayak Voice AI Copilot Widget */}
      <KrishiSahayakCopilot />
    </div>
  );
};

export default AppLayout;
