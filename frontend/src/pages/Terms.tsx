import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { CheckCircle2, AlertTriangle, Scale, BookOpen, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-green-100 selection:text-green-900">
        <Navbar />

        <main className="relative pb-24 pt-32 sm:pt-40">
          {/* Decorative background */}
          <div className="absolute inset-x-0 top-0 h-[500px] overflow-hidden -z-10">
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
            <div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-green-50/80 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          </div>

          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Terms of Use
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Last updated: <span className="font-semibold text-slate-900">September 16, 2026</span>
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Welcome to KrishiOra. These Terms of Use govern your access to and use of the KrishiOra platform, designed to empower Indian farmers with smart agriculture and expense intelligence tools.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16 space-y-16"
            >
              {/* Section 1 */}
              <section className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <UserCheck size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">1. Account Registration</h2>
                </div>
                <div className="prose prose-slate prose-lg text-slate-600">
                  <p>To use KrishiOra, you must register for an account. You agree to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Provide accurate and complete information during registration.</li>
                    <li>Keep your account login credentials secure.</li>
                    <li>Accept responsibility for all activities that occur under your account.</li>
                  </ul>
                  <p className="mt-4">KrishiOra is designed primarily for individual farmers, cooperatives, and agricultural businesses operating in India.</p>
                </div>
              </section>

              {/* Section 2 */}
              <section className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">2. Acceptable Use</h2>
                </div>
                <div className="prose prose-slate prose-lg text-slate-600">
                  <p>You agree to use KrishiOra only for its intended purpose: managing farm plots, crop lifecycles, and agricultural expenses. You may not:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Use the platform for any illegal or unauthorized purpose.</li>
                    <li>Attempt to hack, destabilize, or adapt the KrishiOra application.</li>
                    <li>Upload malicious code or files that could harm the platform or other users.</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <AlertTriangle size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">3. AI Insights & Advisory Disclaimer</h2>
                </div>
                <div className="prose prose-slate prose-lg text-slate-600">
                  <p>KrishiOra provides AI-driven insights, yield estimates, and task recommendations based on the data you provide. However, agriculture is inherently unpredictable due to weather, pests, and market fluctuations.</p>
                  <p className="mt-4 font-semibold text-slate-800">Please note:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>AI insights are <strong>advisory only</strong> and do not guarantee a specific yield, profit, or outcome.</li>
                    <li>You are solely responsible for the physical actions and financial decisions you make on your farm.</li>
                    <li>KrishiOra is not liable for crop failures or financial losses resulting from following the platform's automated recommendations.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Scale size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">4. Limitation of Liability</h2>
                </div>
                <div className="prose prose-slate prose-lg text-slate-600">
                  <p>To the maximum extent permitted by law, KrishiOra and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the platform.</p>
                </div>
              </section>

              <hr className="border-slate-200" />

              {/* Contact */}
              <section className="rounded-2xl bg-slate-50 p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                    <BookOpen size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Contact Legal</h2>
                </div>
                <p className="text-slate-600">
                  If you have any questions regarding these Terms of Use, please reach out to us at <a href="mailto:legal@krishiora.com" className="font-semibold text-green-700 hover:underline">legal@krishiora.com</a>.
                </p>
              </section>

            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default Terms;
