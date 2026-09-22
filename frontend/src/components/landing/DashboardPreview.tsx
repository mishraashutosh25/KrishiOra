import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Sprout, 
  Receipt, 
  BarChart3, 
  Map, 
  Bell, 
  Search,
  Droplets,
  CloudSun,
  TrendingUp,
  CircleCheckBig
} from "lucide-react";

export const DashboardPreview = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('/field-row-texture.svg')] opacity-[0.03]" />
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />
      <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            The Product
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A command center for your farm
          </p>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            See everything that's happening across all your plots in one beautiful, easy-to-use dashboard.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 max-w-5xl rounded-[2rem] border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden ring-1 ring-slate-900/5"
        >
          {/* Browser / App Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-6">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-200" />
              <div className="h-3 w-3 rounded-full bg-slate-200" />
              <div className="h-3 w-3 rounded-full bg-slate-200" />
            </div>
            <div className="flex h-7 w-64 items-center gap-2 rounded-md bg-white px-3 border border-slate-200/60 shadow-sm text-xs text-slate-400">
              <Search size={12} />
              <span>Search farms, crops, expenses...</span>
            </div>
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-slate-400" />
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border border-green-700/20" />
            </div>
          </div>

          <div className="flex h-[500px] sm:h-[600px] bg-slate-50/30">
            {/* Sidebar Mockup */}
            <div className="hidden w-56 flex-col border-r border-slate-100 bg-white p-4 sm:flex">
              <div className="flex items-center gap-2 px-2 pb-6">
                <div className="h-7 w-7 rounded-lg bg-green-600" />
                <span className="font-bold text-slate-900">KrishiOra</span>
              </div>
              <nav className="flex flex-col gap-1.5">
                {[
                  { icon: LayoutDashboard, label: "Overview", active: true },
                  { icon: Map, label: "My Farms" },
                  { icon: Sprout, label: "Crops" },
                  { icon: Receipt, label: "Expenses" },
                  { icon: BarChart3, label: "Analytics" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-green-50 text-green-700"
                        : "text-slate-500"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </div>
                ))}
              </nav>
            </div>

            {/* Main Content Area Mockup */}
            <div className="flex-1 overflow-hidden p-6">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Morning, Ramesh 👋</h3>
                  <p className="text-sm text-slate-500">Here's what's happening on your farms today.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
                  <CloudSun size={16} className="text-sky-500" />
                  <span>28°C · Mostly Sunny</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Active Farms", value: "4 Plots", icon: Map, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Active Crops", value: "Wheat, Mustard", icon: Sprout, color: "text-green-600", bg: "bg-green-50" },
                  { label: "Season Expenses", value: "₹42,500", icon: Receipt, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Expected Yield", value: "+12.4%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-md p-1.5 ${stat.bg}`}>
                        <stat.icon size={14} className={stat.color} />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="mt-2 text-lg font-bold text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Main Content Sections */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Chart Mockup */}
                <div className="col-span-2 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h4 className="font-bold text-slate-900">Expense Breakdown</h4>
                  <div className="mt-6 flex h-48 items-end gap-2 px-2">
                    {[40, 70, 45, 90, 60, 30, 85].map((height, i) => (
                      <div key={i} className="group relative flex w-full flex-col justify-end">
                        <div 
                          className="w-full rounded-t-md bg-gradient-to-t from-green-500 to-emerald-400 transition-all duration-500 group-hover:opacity-80"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks/Alerts Mockup */}
                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col">
                  <h4 className="font-bold text-slate-900">Priority Tasks</h4>
                  <div className="mt-4 flex-1 space-y-3">
                    <div className="flex gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                      <Droplets size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">Irrigate Plot B</p>
                        <p className="text-xs text-amber-700/80">Moisture level dropped below 30%</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg border border-slate-100 p-3">
                      <CircleCheckBig size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">Log fertilizer expense</p>
                        <p className="text-xs text-slate-500">For recent Urea purchase</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
