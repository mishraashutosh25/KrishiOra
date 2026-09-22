import { MapPin, Trees, Sprout, IndianRupee } from "lucide-react";
import StatCard from "../common/StatCard";
import { fallbackKpiMetrics, type DashboardMetric } from "./dashboardFixtures";

interface DashboardKpisProps {
  metrics?: DashboardMetric[];
}

export const DashboardKpis = ({ metrics = fallbackKpiMetrics }: DashboardKpisProps) => {
  const icons = [
    <MapPin key="map" size={20} />,
    <Trees key="trees" size={20} />,
    <Sprout key="sprout" size={20} />,
    <IndianRupee key="rupee" size={20} />,
  ];

  return (
    <section aria-label="Key Farm Metrics" className="mb-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {metrics.map((metric, index) => (
          <StatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={icons[index % icons.length]}
            accentColor={metric.accentColor}
          />
        ))}
      </div>
    </section>
  );
};

export default DashboardKpis;
