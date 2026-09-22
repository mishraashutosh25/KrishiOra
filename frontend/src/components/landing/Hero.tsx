import HeroContent from "./hero/HeroContent";
import HeroVisual from "./hero/HeroVisual";

export const Hero = () => {
  return (
    <section
      id="hero"
      aria-label="KrishiOra Platform Overview"
      className="relative overflow-hidden bg-[#FAFBF9] pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-28"
    >
      {/* Precision Gradient Background Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[560px] w-[55%] bg-[radial-gradient(ellipse_75%_75%_at_100%_0%,_rgba(187,247,208,0.28)_0%,_transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[380px] w-[40%] bg-[radial-gradient(ellipse_65%_65%_at_0%_100%,_rgba(254,243,199,0.22)_0%,_transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] bg-[radial-gradient(circle,_rgba(220,252,231,0.3)_0%,_transparent_75%)] blur-2xl"
      />

      {/* Subtle Agricultural Field Lines Grid Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-[0.25]"
      />

      {/* Main Responsive Grid Container */}
      <div className="relative mx-auto w-full max-w-7xl px-8 sm:px-10 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-10 xl:gap-16">
          {/* 1. Left Editorial Content */}
          <HeroContent />

          {/* 2. Right Agricultural Visual & Unified Console */}
          <HeroVisual />
        </div>
      </div>
    </section>
  );
};

export default Hero;
