import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { Shield, Lock, FileText, Share2, Mail } from "lucide-react";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-green-100 selection:text-green-900">
        <Navbar />

        <main className="relative pb-24 pt-32 sm:pt-40">
          {/* Decorative background */}
          <div className="absolute inset-x-0 top-0 h-[500px] overflow-hidden -z-10">
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
            <div className="absolute -left-40 top-20 h-[400px] w-[400px] rounded-full bg-green-50/80 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          </div>

          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Last updated: <span className="font-semibold text-slate-900">September 16, 2026</span>
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                At KrishiOra, we believe that farmers own their data. We are committed to protecting your privacy and ensuring that the information about your farms, crops, and financial records remains secure.
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
                    <FileText size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">1. Data We Collect</h2>
                </div>
                <div className="prose prose-slate prose-lg text-slate-600">
                  <p>When you use KrishiOra, we collect information that helps us provide you with the best farm management experience:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Account Information:</strong> Name, phone number, and regional language preference.</li>
                    <li><strong>Farm Data:</strong> Plot sizes, locations (if GPS is enabled), soil types, and water resources.</li>
                    <li><strong>Crop & Expense Data:</strong> Sowing dates, harvest predictions, and the financial expenses you log manually.</li>
                    <li><strong>Device Information:</strong> Information to ensure the app works correctly offline and syncs properly on your device.</li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Shield size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">2. How We Use Your Data</h2>
                </div>
                <div className="prose prose-slate prose-lg text-slate-600">
                  <p>We use your data solely to make your farming operations more efficient. This includes:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Providing AI-driven crop advisory insights tailored to your specific plots.</li>
                    <li>Calculating cost-per-acre and overall season profitability.</li>
                    <li>Syncing your offline records securely to the cloud when you connect to the internet.</li>
                    <li>Improving the KrishiOra platform's regional language capabilities.</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Share2 size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">3. Data Sharing (We don't sell your data)</h2>
                </div>
                <div className="prose prose-slate prose-lg text-slate-600">
                  <p>We have a strict anti-selling policy. <strong>We do not sell your personal data or farm yields to third parties, advertisers, or corporate buyers.</strong></p>
                  <p className="mt-4">We may only share data under the following circumstances:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>With your explicit, opt-in consent (e.g., if you choose to share your yield data with a buyer or cooperative).</li>
                    <li>With trusted service providers (like secure cloud hosting) who are legally bound to keep your data confidential.</li>
                    <li>If required by Indian law or valid legal process.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">4. Data Security</h2>
                </div>
                <div className="prose prose-slate prose-lg text-slate-600">
                  <p>Your agricultural data is protected by industry-standard encryption, both while transmitted over the internet and while stored on our servers. We employ strict access controls to ensure only you can view your farm's financial intelligence.</p>
                </div>
              </section>

              <hr className="border-slate-200" />

              {/* Contact */}
              <section className="rounded-2xl bg-slate-50 p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                    <Mail size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Questions?</h2>
                </div>
                <p className="text-slate-600">
                  If you have any questions about this Privacy Policy or how we handle your farm's data, please contact our support team at <a href="mailto:privacy@krishiora.com" className="font-semibold text-green-700 hover:underline">privacy@krishiora.com</a>.
                </p>
              </section>

            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default Privacy;
