/**
 * Isolated Presentational Fixtures for KrishiOra Dashboard
 * Used exclusively as presentational fallback data when no live backend data is connected.
 * Completely decoupled from API services and hooks.
 */

export interface DashboardMetric {
  title: string;
  value: string;
  subtitle: string;
  accentColor: "green" | "amber" | "blue" | "neutral";
}

export interface RecentExpenseItem {
  id: string;
  title: string;
  category: string;
  farm: string;
  amount: number;
  date: string;
  paymentMethod: string;
}

export interface FarmActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "crop" | "expense" | "farm" | "task";
}

export interface AttentionItem {
  id: string;
  severity: "watch" | "healthy" | "harvest";
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
}

export const fallbackKpiMetrics: DashboardMetric[] = [
  {
    title: "Total Farms",
    value: "3 Farms",
    subtitle: "Hoshiarpur & Malwa plots",
    accentColor: "green",
  },
  {
    title: "Total Land Area",
    value: "28.5 Acres",
    subtitle: "24.5 cultivated · 4.0 fallow",
    accentColor: "neutral",
  },
  {
    title: "Active Crops",
    value: "4 Crops",
    subtitle: "Wheat, Mustard, Gram & Fodder",
    accentColor: "green",
  },
  {
    title: "Rabi Season Spend",
    value: "₹42,800",
    subtitle: "66% of ₹65,000 budget",
    accentColor: "amber",
  },
];

export const fallbackRecentExpenses: RecentExpenseItem[] = [
  {
    id: "exp-1",
    title: "NPK 19:19:19 Water Soluble Fertilizer",
    category: "Nutrients & Fertilizer",
    farm: "Hoshiarpur Primary",
    amount: 4800,
    date: "Today, 10:30 AM",
    paymentMethod: "UPI",
  },
  {
    id: "exp-2",
    title: "Tractor Diesel (40 Litres)",
    category: "Fuel & Machinery",
    farm: "Hoshiarpur Primary",
    amount: 3800,
    date: "Yesterday",
    paymentMethod: "Cash",
  },
  {
    id: "exp-3",
    title: "Weeding & Interculture Labour (4 Workers)",
    category: "Labour",
    farm: "Malwa South Plot",
    amount: 2400,
    date: "24 Feb 2026",
    paymentMethod: "Cash",
  },
  {
    id: "exp-4",
    title: "Drip Irrigation Lateral Filter Replacement",
    category: "Equipment & Irrigation",
    farm: "Hoshiarpur Primary",
    amount: 1650,
    date: "21 Feb 2026",
    paymentMethod: "UPI",
  },
];

export const fallbackActivities: FarmActivityItem[] = [
  {
    id: "act-1",
    title: "Foliar Spray Recorded",
    description: "Zinc sulfate applied to Sharbati Wheat in Plot 4A",
    time: "2 hours ago",
    type: "crop",
  },
  {
    id: "act-2",
    title: "Expense Logged",
    description: "₹4,800 recorded for NPK fertilizer",
    time: "Today, 10:30 AM",
    type: "expense",
  },
  {
    id: "act-3",
    title: "Growth Stage Updated",
    description: "Pusa Mustard Plot 2B transitioned to Flowering stage",
    time: "Yesterday",
    type: "crop",
  },
  {
    id: "act-4",
    title: "Irrigation Schedule Completed",
    description: "5 hours solar drip cycle completed on North Plot",
    time: "3 days ago",
    type: "task",
  },
];

export const fallbackAttentionItems: AttentionItem[] = [
  {
    id: "att-1",
    severity: "watch",
    title: "Secondary Irrigation Due",
    description: "Sharbati Wheat (Plot 4A) reaches 45-day crown root initiation. Schedule irrigation within 48 hours.",
    actionText: "View Crop",
    actionHref: "/crops",
  },
  {
    id: "att-2",
    severity: "harvest",
    title: "Mustard Pod Filling Milestone",
    description: "Plot 2B mustard is nearing full pod maturity. Prepare harvest logistics.",
    actionText: "Check Harvest Date",
    actionHref: "/crops",
  },
];
