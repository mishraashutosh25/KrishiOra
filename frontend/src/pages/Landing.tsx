import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";
import TrustStats from "../components/landing/TrustStats";
import DashboardPreview from "../components/landing/DashboardPreview";
import ProblemSolution from "../components/landing/ProblemSolution";
import Features from "../components/landing/Features";
import ExpenseIntelligence from "../components/landing/ExpenseIntelligence";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import Multilingual from "../components/landing/Multilingual";
import FAQ from "../components/landing/FAQ";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-green-100 selection:text-green-900">
        <Navbar />

        <main className="relative">
          <Hero />
          <TrustStats />
          <DashboardPreview />
          <ProblemSolution />
          <Features />
          <ExpenseIntelligence />
          <HowItWorks />
          <Testimonials />
          <Multilingual />
          <FAQ />
          <CTA />
        </main>

        <Footer />
      </div>
  );
};

export default Landing;
