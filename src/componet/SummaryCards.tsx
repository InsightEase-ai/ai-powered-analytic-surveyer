import React from "react";
import { Users, CheckCircle2, HelpCircle, Calendar } from "lucide-react";
import type { OverallAnalyticsStats } from "../lib/mockAnalyticsData";

interface SummaryCardsProps {
  stats: OverallAnalyticsStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: "Total Responses",
      value: stats.totalResponses.toLocaleString(),
      subtext: "+14.2% from last week",
      icon: Users,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      label: "Answer Rate",
      value: `${stats.completionRate}%`,
      subtext: "Average questions answered per response",
      icon: CheckCircle2,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Number of Questions",
      value: String(stats.numberOfQuestions),
      subtext: "Active survey items",
      icon: HelpCircle,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Last Response Date",
      value: stats.lastResponseDate.split(" at ")[0],
      subtext: stats.lastResponseDate.split(" at ")[1]
        ? `at ${stats.lastResponseDate.split(" at ")[1]}`
        : "Recent activity",
      icon: Calendar,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-gray-500 font-medium truncate">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${card.bgColor} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              {card.value}
            </p>
            <p className="text-[11px] text-gray-400 mt-1 truncate">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
