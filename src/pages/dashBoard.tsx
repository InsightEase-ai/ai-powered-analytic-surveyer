import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Plus,
  TrendingUp,
  Pencil,
  CheckCircle2,
  UserPlus,
  Bot,
  Send,
  Minus,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import heroImg from "../assets/hero.png";
import DashboardLayout from "../componet/dashboardLayout";

const activityConfig = {
  survey_edited: {
    icon: Pencil,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    render: (title: string) => (
      <>
        You edited <span className="font-semibold text-gray-900">{title}</span>
      </>
    ),
  },
  survey_published: {
    icon: Send,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    render: (title: string) => (
      <>
        You published{" "}
        <span className="font-semibold text-gray-900">{title}</span>
      </>
    ),
  },
  survey_closed: {
    icon: CheckCircle2,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    render: (title: string) => (
      <>
        You closed <span className="font-semibold text-gray-900">{title}</span>
      </>
    ),
  },
  survey_goal_reached: {
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    render: (title: string) => (
      <>
        <span className="font-semibold text-gray-900">{title}</span> reached its
        response goal
      </>
    ),
  },
  response_received: {
    icon: UserPlus,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    render: (title: string) => (
      <>
        New respondent joined{" "}
        <span className="font-semibold text-gray-900">{title}</span>
      </>
    ),
  },
  survey_reopened: {
    icon: RotateCcw,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    render: (title: string) => (
      <>
        You reopened{" "}
        <span className="font-semibold text-gray-900">{title}</span>
      </>
    ),
  },
} as const;

const chatSuggestions = [
  "Why did satisfaction drop?",
  "Predict next week's responses",
  "Summarize feedback trends",
];

function DashBoard() {
  const currentUser = useQuery(api.users.currentUser);
  const name = currentUser?.name ?? "there";
  const mySurveys = useQuery(api.surveys.recentSurveys) ?? [];
  const totalSurveys = useQuery(api.surveys.surveyCount) ?? 0;
  const responsesThisMonth = useQuery(api.surveys.responsesThisMonth) ?? 0;
  const avgAnswerRate = useQuery(api.surveys.avgAnswerRate) ?? 0;
  const recentActivity = useQuery(api.surveys.recentActivity) ?? [];

  const stats = [
    {
      label: "Total Surveys",
      value: String(totalSurveys),
      trend:
        totalSurveys === 0
          ? "No surveys yet"
          : totalSurveys === 1
            ? "1 survey in Drafts"
            : `${totalSurveys} surveys in Drafts`,
      positive: totalSurveys > 0 ? true : null,
    },
    {
      label: "Responses this month",
      value: String(responsesThisMonth),
      trend: null,
      positive: null,
    },
    {
      label: "Avg. Answer Rate",
      value: `${avgAnswerRate}%`,
      trend: "Stable trend",
      positive: null,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero — full width */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-snug">
              Welcome back, {name}! Ready to explore your data? I&apos;m your{" "}
              <Link
                to="/chatbot"
                className="text-teal-500 font-semibold hover:text-teal-600"
              >
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
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
              {stat.trend && (
                <p
                  className={`mt-2 text-xs flex items-center gap-1.5 ${
                    stat.positive === true ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {stat.positive === true && (
                    <TrendingUp className="w-3.5 h-3.5" />
                  )}
                  {stat.positive === null && <Minus className="w-3.5 h-3.5" />}
                  {stat.trend}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 3-Column Aligned Layout matching the 3 top stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1: Aligned under "Total Surveys" -> Recent Activity */}
          <div className="bg-[#E8ECF0] rounded-2xl p-5 flex flex-col min-h-[380px]">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            {recentActivity.length > 0 ? (
              <ul className="space-y-4 flex-1">
                {recentActivity.slice(0, 5).map((activity) => {
                  const config = activityConfig[activity.type];
                  return (
                    <li key={activity._id} className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}
                      >
                        <config.icon
                          className={`w-4 h-4 ${config.iconColor}`}
                        />
                      </div>
                      <div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {config.render(activity.surveyTitle)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity._creationTime).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6 flex-1 flex items-center justify-center">
                No recent activity yet.
              </p>
            )}
          </div>

          {/* Column 2: Aligned under "Responses this month" -> Recent Surveys */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col min-h-[380px]">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Recent Surveys
            </h2>
            <div className="space-y-3 flex-1">
              {mySurveys.length > 0 ? (
                mySurveys.slice(0, 3).map((survey) => {
                  const count = survey.responseCount;
                  const isPublished = survey.status === "published";
                  const isClosed = survey.status === "closed";
                  const manageable = isPublished || isClosed;
                  return (
                    <Link
                      key={survey._id}
                      to={
                        manageable
                          ? `/surveys/${survey._id}`
                          : `/survey?id=${survey._id}`
                      }
                      className="block border border-gray-100 rounded-xl p-4 hover:border-teal-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {survey.title}
                        </h3>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isPublished
                              ? "bg-green-500 text-white"
                              : isClosed
                                ? "bg-amber-500 text-white"
                                : "bg-gray-400 text-white"
                          }`}
                        >
                          {isPublished
                            ? "OPEN"
                            : isClosed
                              ? "COMPLETE"
                              : "DRAFT"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {count} Response{count === 1 ? "" : "s"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(survey.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-6 flex-1 flex items-center justify-center">
                  No surveys yet. Create one to get started.
                </p>
              )}
            </div>
          </div>

          {/* Column 3: Aligned under "Avg. Answer Rate" -> Sherpa AI */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[380px]">
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    Ask me anything about your data...
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Sherpa AI is online
                  </p>
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
                <button
                  type="button"
                  className="text-teal-500 hover:text-teal-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-[#0B192C] text-white px-5 py-4 flex items-center justify-between gap-3 relative overflow-hidden shrink-0">
              <div className="relative z-10 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#8BB1D4] shrink-0" />
                <div>
                  <p className="text-[11px] font-bold tracking-widest">
                    READY TO ASSIST
                  </p>
                  <p className="text-xs text-[#8BB1D4] mt-0.5">
                    AI Insights Active
                  </p>
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
    </DashboardLayout>
  );
}

export default DashBoard;
