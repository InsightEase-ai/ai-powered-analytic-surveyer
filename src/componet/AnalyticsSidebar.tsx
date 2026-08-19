import React from "react";
import { LayoutDashboard, BarChart2, PieChart, LineChart, Table } from "lucide-react";

export type AnalyticsTab = "barcharts" | "piecharts" | "linecharts" | "tables";

interface AnalyticsSidebarProps {
  activeTab: AnalyticsTab;
  onSelectTab: (tab: AnalyticsTab) => void;
  barChartCount?: number;
  pieChartCount?: number;
  lineChartCount?: number;
  tableCount?: number;
}

export const AnalyticsSidebar: React.FC<AnalyticsSidebarProps> = ({
  activeTab,
  onSelectTab,
  barChartCount = 3,
  pieChartCount = 3,
  lineChartCount = 2,
  tableCount = 7,
}) => {
  const navItems: {
    id: AnalyticsTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }[] = [
    {
      id: "barcharts",
      label: "Bar Charts",
      icon: BarChart2,
      badge: barChartCount,
    },
    {
      id: "piecharts",
      label: "Pie Charts",
      icon: PieChart,
      badge: pieChartCount,
    },
    {
      id: "linecharts",
      label: "Line Charts",
      icon: LineChart,
      badge: lineChartCount,
    },
    {
      id: "tables",
      label: "Tables Summary",
      icon: Table,
      badge: tableCount,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm shrink-0 self-start">
      <div className="px-3 py-2 mb-2 border-b border-gray-100">
        <p className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">
          Analytics Navigation
        </p>
      </div>

      <nav className="space-y-1" aria-label="Analytics Sidebar Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#0B192C] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-teal-400" : "text-gray-400"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-teal-500/20 text-teal-300"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
