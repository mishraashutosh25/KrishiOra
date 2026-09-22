import { motion } from "framer-motion";
import { Leaf, Sprout, BarChart3, Users, Globe, ArrowRight } from "lucide-react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const About = () => {
  const values = [
    {
      title: "Farmer First",
      description: "Everything we build starts with the farmer. We design simple, powerful tools that solve real problems on the ground.",
      icon: Users,
    },
    {
      title: "Data Driven",
      description: "We believe in the power of clear information. By turning complex farm data into simple insights, we help you make confident decisions.",
      icon: BarChart3,
    },
    {
      title: "Sustainable Future",
      description: "Better farming means caring for the land. We promote practices that ensure long-term profitability and environmental health.",
      icon: Leaf,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-green-100 selection:text-green-900">
        <Navbar />

        <main className="relative pt-24 pb-16 sm:pt-32">
          {/* Hero Section */}
          <section className="relative overflow-hidden px-6 py-20 sm:px-10 lg:px-16 xl:px-20">
            {/* Background Orbs */}
            <div aria-hidden="true" className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-green-200/40 blur-3xl" />
            <div aria-hidden="true" className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
            
            <div className="relative mx-auto max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-green-200 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-green-700 shadow-sm backdrop-blur-md">
                  <Globe size={14} />
                  <span>Our Mission</span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">
                  Redefining <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Indian Agriculture
                  </span>
                </h1>
                
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  KrishiOra is built to bridge the gap between traditional farming and modern technology. We provide farmers with the clarity they need to operate profitably, sustainably, and with confidence.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Mission Image / Banner Section */}
          <section className="relative mx-auto mt-10 max-w-7xl px-6 sm:px-10 lg:px-16 xl:px-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative overflow-hidden rounded-[2.5rem] shadow-2xl"
            >
              <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
              <img 
                src="https://images.unsplash.com/photo-1592982537447-6f2a6a0a382e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="Farmers working in a field" 
                className="h-[400px] w-full object-cover sm:h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:p-16">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    "We envision a future where every farmer has the digital tools to maximize their yield and minimize their costs."
                  </h2>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Core Values Section */}
          <section className="relative mx-auto mt-24 max-w-7xl px-6 pb-20 sm:mt-32 sm:px-10 lg:px-16 xl:px-20">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Our Core Values</h2>
              <p className="mt-4 text-slate-600">The principles that guide everything we build at KrishiOra.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="group relative flex flex-col items-start rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700 transition-colors duration-500 group-hover:bg-green-600 group-hover:text-white">
                      <Icon size={28} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{value.title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="mx-auto mt-10 max-w-4xl px-6 sm:px-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[2.5rem] bg-green-950 p-10 text-center shadow-2xl sm:p-16"
            >
              <div className="absolute inset-0 bg-[url('/field-row-texture.svg')] opacity-[0.05]" />
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-green-500/20 blur-3xl" />
              
              <div className="relative z-10">
                <Sprout className="mx-auto mb-6 text-green-400" size={40} />
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to grow with us?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-lg text-green-100/70">
                  Join thousands of farmers across India who are managing their farms smarter.
                </p>
                <a
                  href="/register"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3.5 text-sm font-semibold text-green-950 transition-all hover:bg-green-400 hover:scale-105"
                >
                  Create your free account
                  <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          </section>
        </main>

        <Footer />
      </div>
  );
};

export default About;
