import { useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import Header from "../componet/header";
import { ReportToolbar } from "../componet/ReportToolbar";
import { AnalyticsHeader } from "../componet/AnalyticsHeader";
import { AnalyticsSidebar, type AnalyticsTab } from "../componet/AnalyticsSidebar";
import { SummaryCards } from "../componet/SummaryCards";
import { ChartCard } from "../componet/ChartCard";
import { InterpretationCard } from "../componet/InterpretationCard";
import { getMockAnalytics } from "../lib/mockAnalyticsData";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Clock, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowUpRight } from "lucide-react";

export default function AnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const surveyIdParam = searchParams.get("id");

  // Fetch list of user surveys to allow selecting
  const allSurveys = useQuery(api.surveys.listSurveys) ?? [];

  // Fetch real survey title if surveyIdParam exists in Convex
  const survey = useQuery(
    api.surveys.getSurveyById,
    surveyIdParam ? { id: surveyIdParam as Id<"surveys"> } : "skip"
  );

  const [activeTab, setActiveTab] = useState<AnalyticsTab>("barcharts");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedSurveyId = surveyIdParam || (allSurveys.length > 0 ? allSurveys[0]._id : undefined);

  const activeSurveyTitle = survey?.title || (allSurveys.find(s => s._id === selectedSurveyId)?.title) || (selectedSurveyId ? `Survey #${selectedSurveyId.slice(-4)}` : undefined);

  // Fetch actual responses for the selected survey from Convex without modifying convex folder
  const realResponses = useQuery(
    api.surveys.getResponsesForSurvey,
    selectedSurveyId ? { surveyId: selectedSurveyId as Id<"surveys"> } : "skip"
  ) ?? [];

  // Load baseline mock analytics data for selected survey
  const mockAnalytics = getMockAnalytics(
    activeSurveyTitle,
    selectedSurveyId
  );

  // Compute live analytics from real survey data if questions & responses exist
  const analytics = (() => {
    if (!survey || !survey.questions || realResponses.length === 0) {
      return mockAnalytics;
    }

    const totalResponses = realResponses.length;
    const questions = survey.questions.filter((q: any) => q.type !== "page_break");

    // Dynamic Bar Charts generated from actual choices
    const barCharts = questions
      .filter((q: any) => (q.type === "multiple_choice" || q.type === "rating") && q.options && q.options.length > 0)
      .map((q: any, idx: number) => {
        const optionCounts: Record<string, number> = {};
        q.options.forEach((opt: string) => {
          optionCounts[opt] = 0;
        });

        let answeredCount = 0;
        realResponses.forEach((resp: any) => {
          const ans = resp.answers[q.id];
          if (ans !== undefined && ans !== "") {
            answeredCount++;
            if (Array.isArray(ans)) {
              ans.forEach((val: string) => {
                if (optionCounts[val] !== undefined) optionCounts[val]++;
                else optionCounts[val] = 1;
              });
            } else {
              const valStr = String(ans);
              if (optionCounts[valStr] !== undefined) optionCounts[valStr]++;
              else optionCounts[valStr] = 1;
            }
          }
        });

        const data = Object.entries(optionCounts).map(([option, count]) => ({
          option,
          count,
          percentage: answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0,
        }));

        const topOption = [...data].sort((a, b) => b.count - a.count)[0];
        const interpretation = topOption && topOption.count > 0
          ? `"${topOption.option}" is currently the top selected response (${topOption.percentage}% of answered questions).`
          : "Responses recorded for this question are currently being aggregated.";

        return {
          id: `real_bar_${q.id || idx}`,
          questionTitle: `Q${idx + 1}: ${q.title}`,
          questionType: q.type === "rating" ? "Rating Scale" : "Multiple Choice",
          totalAnswers: answeredCount,
          interpretation,
          data,
        };
      });

    // Dynamic Response Table generated from real submissions
    const responseTable = realResponses.slice(0, 15).map((resp: any, i: number) => {
      const dateStr = new Date(resp._creationTime).toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        id: resp._id,
        responseId: `RESP-${resp._id.slice(-5).toUpperCase()}`,
        submittedAt: dateStr,
        completionTime: "2m 15s",
        userSegment: "Verified User",
        satisfactionScore: 5,
        primaryRole: "Respondent",
        status: "Completed",
      };
    });

    return {
      ...mockAnalytics,
      stats: {
        ...mockAnalytics.stats,
        totalResponses,
        numberOfQuestions: questions.length,
        lastResponseDate: realResponses[0]
          ? new Date(realResponses[0]._creationTime).toLocaleString()
          : mockAnalytics.stats.lastResponseDate,
      },
      barCharts: barCharts.length > 0 ? barCharts : mockAnalytics.barCharts,
      responseTable: responseTable.length > 0 ? responseTable : mockAnalytics.responseTable,
    };
  })();

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate real-time data sync/fetch delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleSelectSurvey = (id: string) => {
    if (id) {
      setSearchParams({ id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-dvh bg-[#F4F6F8] font-sans text-sm flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Report Toolbar */}
        <ReportToolbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* Top Analytics Header */}
        <AnalyticsHeader
          title={analytics.surveyTitle}
          responseCount={analytics.stats.totalResponses}
          lastUpdated={analytics.lastUpdated}
          surveyId={selectedSurveyId}
          allSurveys={allSurveys}
          onSelectSurvey={handleSelectSurvey}
        />

        {/* Layout with Left Sidebar + Dynamic Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar */}
          <AnalyticsSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            barChartCount={analytics.barCharts.length}
            pieChartCount={analytics.pieCharts.length}
            lineChartCount={analytics.lineCharts.length}
            tableCount={analytics.responseTable.length}
          />

          {/* Main Analytics Content Panel */}
          <div className="flex-1 w-full space-y-6 min-w-0">

            {/* BAR CHARTS SECTION */}
            {activeTab === "barcharts" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">
                    Bar Charts Visualization
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Distribution of single-choice and multiple-choice question responses.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {analytics.barCharts.map((chart) => (
                    <ChartCard
                      key={chart.id}
                      title={chart.questionTitle}
                      subtitle={`${chart.questionType} • ${chart.totalAnswers} total answers`}
                    >
                      <div className="h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chart.data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                              dataKey="option"
                              tick={{ fontSize: 11, fill: "#475569" }}
                              interval={0}
                              angle={-10}
                              textAnchor="end"
                            />
                            <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                            <Tooltip
                              formatter={(val: any) => [`${val} responses`, "Count"]}
                              contentStyle={{
                                backgroundColor: "#0B192C",
                                borderRadius: "12px",
                                color: "#FFF",
                                fontSize: "12px",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                              }}
                            />
                            <Bar dataKey="count" fill="#0D9488" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <InterpretationCard interpretation={chart.interpretation} />
                    </ChartCard>
                  ))}
                </div>
              </div>
            )}

            {/* PIE CHARTS SECTION */}
            {activeTab === "piecharts" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">
                    Pie Charts Categorical Analysis
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Proportions and breakdown of user segments and background demographics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analytics.pieCharts.map((chart) => (
                    <ChartCard
                      key={chart.id}
                      title={chart.questionTitle}
                      subtitle={`Total Responses: ${chart.totalAnswers}`}
                    >
                      <div className="h-72 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chart.data}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={95}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {chart.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(val: any) => [`${val} responses`, "Volume"]}
                              contentStyle={{
                                backgroundColor: "#0B192C",
                                borderRadius: "10px",
                                color: "#FFF",
                                fontSize: "12px",
                                border: "none",
                              }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                              iconType="circle"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <InterpretationCard interpretation={chart.interpretation} />
                    </ChartCard>
                  ))}
                </div>
              </div>
            )}

            {/* LINE CHARTS SECTION */}
            {activeTab === "linecharts" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">
                    Line Charts Response Trends
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Time series tracking of daily response submissions and completion percentages.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {analytics.lineCharts.map((chart) => (
                    <ChartCard key={chart.id} title={chart.chartTitle}>
                      <div className="h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chart.data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 15 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 11, fill: "#475569" }}
                            />
                            <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0B192C",
                                borderRadius: "10px",
                                color: "#FFF",
                                fontSize: "12px",
                                border: "none",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="responses"
                              stroke="#0D9488"
                              strokeWidth={3}
                              dot={{ r: 4, fill: "#0D9488" }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <InterpretationCard interpretation={chart.interpretation} />
                    </ChartCard>
                  ))}
                </div>
              </div>
            )}

            {/* TABLES SUMMARY SECTION */}
            {activeTab === "tables" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">
                    Detailed Response Data Table
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Tabular view of respondent submissions, completion duration, and attributes.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                      <span className="font-bold text-gray-900 text-sm">
                        Submissions Breakdown ({analytics.responseTable.length} Rows Shown)
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      Mock Data • API sync ready
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                          <th className="py-3 px-4">Response ID</th>
                          <th className="py-3 px-4">Submitted At</th>
                          <th className="py-3 px-4">User Segment</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Duration</th>
                          <th className="py-3 px-4">CSAT Score</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {analytics.responseTable.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-gray-900">
                              {row.responseId}
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {row.submittedAt}
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-800">
                              {row.userSegment}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {row.primaryRole}
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {row.completionTime}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                ★ {row.satisfactionScore}/5
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                  row.status === "Completed"
                                    ? "bg-teal-50 text-teal-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
