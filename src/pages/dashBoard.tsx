import { Link } from "react-router";
import {
  Plus,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Info,
  Pencil,
  CheckCircle2,
  UserPlus,
  Bot,
  Send,
  ArrowRight,
  Minus,
  Sparkles,
} from "lucide-react";
import heroImg from "../assets/hero.png";
import DashboardLayout from "../componet/dashboardLayout";

const stats = [
  { label: "Total Surveys", value: "8", trend: "2 new this week", positive: true },
  { label: "Responses this month", value: "1,245", trend: "+12% vs last month", positive: true },
  { label: "Avg. Completion", value: "82%", trend: "Stable trend", positive: null },
];

const insights = [
  {
    border: "border-l-red-500",
    icon: AlertTriangle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    badge: "PRIORITY: HIGH",
    badgeColor: "text-red-500",
    title: "Satisfaction dropped 22%",
    body: "Customers are mentioning 'slow loading times' in your Q3 Product Feedback survey.",
    time: "2 hours ago",
    action: "INVESTIGATE",
  },
  {
    border: "border-l-green-500",
    icon: TrendingUp,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    badge: "TREND",
    badgeColor: "text-green-600",
    title: "Viral Growth Spike",
    body: "Referral conversion rates have increased by 45% in the last 72 hours.",
    time: "5 hours ago",
    action: "EXPAND STUDY",
  },
  {
    border: "border-l-teal-500",
    icon: Lightbulb,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
    badge: "OPPORTUNITY",
    badgeColor: "text-teal-600",
    title: "Ideal Survey Window",
    body: "Target users at 10:00 AM PST for a predicted 15% increase in response rate.",
    time: "Yesterday",
    action: "SCHEDULE",
  },
  {
    border: "border-l-blue-500",
    icon: Info,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    badge: "INFO",
    badgeColor: "text-blue-500",
    title: "New Segment Found",
    body: "I've identified a 'Power User' cluster in your recent NPS data.",
    time: "2 days ago",
    action: "VIEW CLUSTER",
  },
];

const activities = [
  {
    icon: Pencil,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    text: "You edited ",
    highlight: "Annual Employee Survey",
    time: "30 minutes ago",
  },
  {
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    text: "",
    highlight: "Customer Exit Interview",
    suffix: " reached its goal of 500 responses",
    time: "4 hours ago",
  },
  {
    icon: UserPlus,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    text: "New respondent joined ",
    highlight: "Brand Awareness Study",
    time: "12 hours ago",
  },
];

const recentSurveys = [
  {
    name: "Product Q3 Beta",
    responses: "432 Responses",
    status: "ACTIVE",
    statusColor: "bg-green-500 text-white",
    completion: "88% Complete",
  },
  {
    name: "Brand Health 2024",
    responses: "1,200 Responses",
    status: "COMPLETED",
    statusColor: "bg-gray-400 text-white",
    completion: "100% Complete",
  },
  {
    name: "Customer Satisfaction Q3",
    responses: "89 Responses",
    status: "ACTIVE",
    statusColor: "bg-green-500 text-white",
    completion: "45% Complete",
  },
];

const chatSuggestions = [
  "Why did satisfaction drop?",
  "Predict next week's responses",
  "Summarize feedback trends",
];

function DashBoard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero — full width */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-snug">
              Welcome back, Julius! Ready to explore your data? I&apos;m your{" "}
              <Link to="/chatbot" className="text-teal-500 font-semibold hover:text-teal-600">
                Data Sherpa
              </Link>
              .
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here&apos;s what happened with your surveys while you were away.
            </p>
          </div>
          <Link
            to="/survey"
            className="inline-flex items-center gap-2 shrink-0 bg-[#0B192C] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#152a40] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Survey
          </Link>
        </div>

        {/* Stats — full width */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p
                className={`mt-2 text-xs flex items-center gap-1.5 ${
                  stat.positive === true ? "text-green-600" : "text-gray-400"
                }`}
              >
                {stat.positive === true && <TrendingUp className="w-3.5 h-3.5" />}
                {stat.positive === null && <Minus className="w-3.5 h-3.5" />}
                {stat.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Main + sidebar — aligned from insights down */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left column (~70%) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Proactive Insights */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Proactive Insights</h2>
                <Link to="/insights" className="text-sm text-teal-500 hover:text-teal-600 flex items-center gap-1">
                  View All Insights <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <div
                    key={insight.title}
                    className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 ${insight.border} flex flex-col`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`w-9 h-9 rounded-full ${insight.iconBg} flex items-center justify-center shrink-0`}>
                        <insight.icon className={`w-4 h-4 ${insight.iconColor}`} />
                      </div>
                      <span className={`text-[10px] font-bold tracking-wide ${insight.badgeColor}`}>
                        {insight.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5">{insight.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed flex-1">{insight.body}</p>
                    <div className="flex items-center justify-between text-xs mt-4">
                      <span className="text-gray-400">{insight.time}</span>
                      <button type="button" className="text-[#0B192C] font-bold tracking-wide hover:opacity-80">
                        {insight.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity — light grey container */}
            <div className="bg-[#E8ECF0] rounded-2xl p-5 flex-1 flex flex-col">
              <h2 className="text-base font-bold text-gray-900 mb-4">Recent Activity</h2>
              <ul className="space-y-4 flex-1">
                {activities.map((activity) => (
                  <li key={activity.highlight + activity.time} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0`}>
                      <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {activity.text}
                        <span className="font-semibold text-gray-900">{activity.highlight}</span>
                        {activity.suffix}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right sidebar (~30%) */}
          <div className="flex flex-col gap-4 h-full">
            {/* Recent Surveys */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Recent Surveys</h2>
              <div className="space-y-3">
                {recentSurveys.map((survey) => (
                  <div key={survey.name} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{survey.name}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${survey.statusColor}`}>
                        {survey.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{survey.responses}</p>
                      <p className="text-xs text-gray-400">{survey.completion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sherpa AI */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm leading-tight">
                      Ask me anything about your data...
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">Sherpa AI is online</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {chatSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="text-xs text-left bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-600 px-3 py-2 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mt-auto">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                  />
                  <button type="button" className="text-teal-500 hover:text-teal-600">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-[#0B192C] text-white px-5 py-4 flex items-center justify-between gap-3 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#8BB1D4] shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold tracking-widest">READY TO ASSIST</p>
                    <p className="text-xs text-[#8BB1D4] mt-0.5">AI Insights Active</p>
                  </div>
                </div>
                <img
                  src={heroImg}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg opacity-80 relative z-10 shrink-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashBoard;
