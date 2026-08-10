import { useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import Header from "../componet/header";
import { ReportToolbar } from "../componet/ReportToolbar";
import { AnalyticsHeader } from "../componet/AnalyticsHeader";
import {
  AnalyticsSidebar,
  type AnalyticsTab,
} from "../componet/AnalyticsSidebar";
import { SummaryCards } from "../componet/SummaryCards";
import { ChartCard } from "../componet/ChartCard";
import { InterpretationCard } from "../componet/InterpretationCard";
import { CHART_COLORS } from "../lib/mockAnalyticsData";
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
import { FileSpreadsheet } from "lucide-react";

export default function AnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const surveyIdParam = searchParams.get("id");

  // Fetch list of user surveys to allow selecting
  const allSurveys = useQuery(api.surveys.listSurveys) ?? [];

  const [activeTab, setActiveTab] = useState<AnalyticsTab>("barcharts");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const selectedSurveyId =
    surveyIdParam || (allSurveys.length > 0 ? allSurveys[0]._id : undefined);

  // Fetch the real survey (questions, etc.) for whichever survey is actually
  // selected — this must use selectedSurveyId, not surveyIdParam, since
  // selectedSurveyId also covers the "no ?id in URL yet" fallback case.
  const survey = useQuery(
    api.surveys.getSurveyById,
    selectedSurveyId ? { id: selectedSurveyId as Id<"surveys"> } : "skip",
  );

  const activeSurveyTitle =
    survey?.title ||
    allSurveys.find((s) => s._id === selectedSurveyId)?.title ||
    (selectedSurveyId ? `Survey #${selectedSurveyId.slice(-4)}` : undefined);

  // Fetch actual responses for the selected survey from Convex without modifying convex folder
  const realResponses =
    useQuery(
      api.surveys.getResponsesForSurvey,
      selectedSurveyId
        ? { surveyId: selectedSurveyId as Id<"surveys"> }
        : "skip",
    ) ?? [];

  // Compute live analytics from real survey data if questions & responses exist
  const analytics = (() => {
    if (!survey || !survey.questions) {
      return {
        surveyId: selectedSurveyId ?? "",
        surveyTitle: activeSurveyTitle ?? "No survey selected",
        lastUpdated: "—",
        stats: {
          totalResponses: 0,
          completionRate: 0,
          numberOfQuestions: 0,
          lastResponseDate: "—",
        },
        recentActivity: [],
        barCharts: [],
        pieCharts: [],
        lineCharts: [],
        responseTable: [],
      };
    }

    const totalResponses = realResponses.length;
    const questions = survey.questions.filter((q) => q.type !== "page_break");

    const surveyAnswerRate =
      realResponses.length > 0 && questions.length > 0
        ? Math.round(
            (realResponses.reduce((sum, resp) => {
              const answered = questions.filter(
                (q) =>
                  resp.answers[q.id] !== undefined && resp.answers[q.id] !== "",
              ).length;
              return sum + answered / questions.length;
            }, 0) /
              realResponses.length) *
              100,
          )
        : 0;

    // Dynamic Bar Charts generated from actual choices
    const barCharts = questions
      .filter(
        (q) =>
          (q.type === "multiple_choice" || q.type === "rating") &&
          q.options &&
          q.options.length > 0,
      )
      .map((q, idx: number) => {
        const optionCounts: Record<string, number> = {};
        q.options?.forEach((opt: string) => {
          optionCounts[opt] = 0;
        });

        let answeredCount = 0;
        realResponses.forEach((resp) => {
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
          percentage:
            answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0,
        }));

        const topOption = [...data].sort((a, b) => b.count - a.count)[0];
        const interpretation =
          topOption && topOption.count > 0
            ? `"${topOption.option}" is currently the top selected response (${topOption.percentage}% of answered questions).`
            : "Responses recorded for this question are currently being aggregated.";

        return {
          id: `real_bar_${q.id || idx}`,
          questionTitle: `Q${idx + 1}: ${q.title}`,
          questionType:
            q.type === "rating" ? "Rating Scale" : "Multiple Choice",
          totalAnswers: answeredCount,
          interpretation,
          data,
        };
      });

    const pieChartColors = [
      CHART_COLORS.teal,
      CHART_COLORS.navy,
      CHART_COLORS.blue,
      CHART_COLORS.amber,
      CHART_COLORS.purple,
      CHART_COLORS.emerald,
      CHART_COLORS.indigo,
      CHART_COLORS.rose,
    ];

    const pieCharts = questions
      .filter((q) => q.type === "dropdown" && q.options && q.options.length > 0)
      .map((q, idx: number) => {
        const optionCounts: Record<string, number> = {};
        q.options?.forEach((opt: string) => {
          optionCounts[opt] = 0;
        });

        let answeredCount = 0;
        realResponses.forEach((resp) => {
          const ans = resp.answers[q.id];
          if (ans !== undefined && ans !== "") {
            answeredCount++;
            const valStr = String(ans);
            if (optionCounts[valStr] !== undefined) optionCounts[valStr]++;
            else optionCounts[valStr] = 1;
          }
        });

        const data = Object.entries(optionCounts).map(
          ([name, value], colorIdx) => ({
            name,
            value,
            color: pieChartColors[colorIdx % pieChartColors.length],
          }),
        );

        const topEntry = [...data].sort((a, b) => b.value - a.value)[0];
        const interpretation =
          topEntry && topEntry.value > 0
            ? `"${topEntry.name}" is the most common answer (${answeredCount > 0 ? Math.round((topEntry.value / answeredCount) * 100) : 0}% of answered responses).`
            : "Responses recorded for this question are currently being aggregated.";

        return {
          id: `real_pie_${q.id || idx}`,
          questionTitle: `Q${idx + 1}: ${q.title}`,
          totalAnswers: answeredCount,
          interpretation,
          data,
        };
      });

    // Dynamic Line Chart: daily response volume
    const dailyCounts: Record<string, number> = {};
    realResponses.forEach((resp) => {
      const d = new Date(resp._creationTime);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyCounts[sortKey] = (dailyCounts[sortKey] || 0) + 1;
    });

    const dailyVolumeData = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sortKey, count]) => {
        const [year, month, day] = sortKey.split("-").map(Number);
        const label = new Date(year, month - 1, day).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "2-digit",
          },
        );
        return { date: label, responses: count, completionRate: 0 };
      });

    const lineCharts =
      dailyVolumeData.length > 0
        ? [
            {
              id: "real_line_daily_volume",
              chartTitle: "Daily Response Volume",
              interpretation:
                dailyVolumeData.length > 1
                  ? `Responses are being tracked across ${dailyVolumeData.length} days, with the busiest day recording ${Math.max(...dailyVolumeData.map((d) => d.responses))} submissions.`
                  : "Not enough days of data yet to identify a trend.",
              data: dailyVolumeData,
            },
          ]
        : [];

    // Dynamic Line Chart: daily answer rate (real replacement for fake "completion rate")
    const dailyAnswerRateBuckets: Record<
      string,
      { totalRate: number; count: number }
    > = {};
    realResponses.forEach((resp) => {
      const d = new Date(resp._creationTime);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const answered = questions.filter(
        (q) => resp.answers[q.id] !== undefined && resp.answers[q.id] !== "",
      ).length;
      const rate = questions.length > 0 ? answered / questions.length : 0;

      if (!dailyAnswerRateBuckets[sortKey]) {
        dailyAnswerRateBuckets[sortKey] = { totalRate: 0, count: 0 };
      }
      dailyAnswerRateBuckets[sortKey].totalRate += rate;
      dailyAnswerRateBuckets[sortKey].count += 1;
    });

    const dailyAnswerRateData = Object.entries(dailyAnswerRateBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sortKey, bucket]) => {
        const [year, month, day] = sortKey.split("-").map(Number);
        const label = new Date(year, month - 1, day).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "2-digit",
          },
        );
        return {
          date: label,
          responses: bucket.count,
          completionRate: Math.round((bucket.totalRate / bucket.count) * 100),
        };
      });

    if (dailyAnswerRateData.length > 0) {
      lineCharts.push({
        id: "real_line_answer_rate",
        chartTitle: "Daily Answer Rate",
        interpretation:
          dailyAnswerRateData.length > 1
            ? `Answer completeness has ranged between ${Math.min(...dailyAnswerRateData.map((d) => d.completionRate))}% and ${Math.max(...dailyAnswerRateData.map((d) => d.completionRate))}% across tracked days.`
            : "Not enough days of data yet to identify a trend.",
        data: dailyAnswerRateData,
      });
    }

    // Dynamic Response Table generated from real submissions
    const responseTable = realResponses.slice(0, 15).map((resp) => {
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
        status: "Completed",
      };
    });

    return {
      surveyId: selectedSurveyId ?? "",
      surveyTitle: activeSurveyTitle ?? survey.title,
      lastUpdated: new Date().toLocaleString(),
      stats: {
        totalResponses,
        completionRate: surveyAnswerRate,
        numberOfQuestions: questions.length,
        lastResponseDate: realResponses[0]
          ? new Date(realResponses[0]._creationTime).toLocaleString()
          : "—",
      },
      recentActivity: [],
      barCharts,
      pieCharts,
      lineCharts,
      responseTable,
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

        <SummaryCards stats={analytics.stats} />

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
                    Distribution of single-choice and multiple-choice question
                    responses.
                  </p>
                </div>

                {analytics.barCharts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                    <p className="text-sm text-gray-500">
                      No bar chart data yet — this survey has no multiple-choice
                      or rating questions with responses.
                    </p>
                  </div>
                ) : (
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
                              margin={{
                                top: 10,
                                right: 20,
                                left: 0,
                                bottom: 25,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#F1F5F9"
                              />
                              <XAxis
                                dataKey="option"
                                tick={{ fontSize: 11, fill: "#475569" }}
                                interval={0}
                                angle={-10}
                                textAnchor="end"
                              />
                              <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                              <Tooltip
                                formatter={(val) => [
                                  `${val} responses`,
                                  "Volume",
                                ]}
                                contentStyle={{
                                  backgroundColor: "#0B192C",
                                  borderRadius: "12px",
                                  color: "#FFF",
                                  fontSize: "12px",
                                  border: "none",
                                  boxShadow:
                                    "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                                }}
                              />
                              <Bar
                                dataKey="count"
                                fill="#0D9488"
                                radius={[6, 6, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <InterpretationCard
                          interpretation={chart.interpretation}
                        />
                      </ChartCard>
                    ))}
                  </div>
                )}
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
                    Proportions and breakdown of user segments and background
                    demographics.
                  </p>
                </div>

                {analytics.pieCharts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                    <p className="text-sm text-gray-500">
                      No pie chart data yet — this survey has no dropdown
                      questions with responses.
                    </p>
                  </div>
                ) : (
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
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(val) => [
                                  `${val} responses`,
                                  "Volume",
                                ]}
                                contentStyle={{
                                  backgroundColor: "#0B192C",
                                  borderRadius: "10px",
                                  color: "#FFF",
                                  fontSize: "12px",
                                  border: "none",
                                }}
                              />
                              <Legend
                                wrapperStyle={{
                                  fontSize: "11px",
                                  paddingTop: "12px",
                                }}
                                iconType="circle"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <InterpretationCard
                          interpretation={chart.interpretation}
                        />
                      </ChartCard>
                    ))}
                  </div>
                )}
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
                    Time series tracking of daily response submissions and
                    completion percentages.
                  </p>
                </div>

                {analytics.lineCharts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                    <p className="text-sm text-gray-500">
                      No response trend data yet — line charts appear once this
                      survey has responses.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {analytics.lineCharts.map((chart) => (
                      <ChartCard key={chart.id} title={chart.chartTitle}>
                        <div className="h-72 w-full pt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={chart.data}
                              margin={{
                                top: 10,
                                right: 20,
                                left: 0,
                                bottom: 15,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#F1F5F9"
                              />
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
                        <InterpretationCard
                          interpretation={chart.interpretation}
                        />
                      </ChartCard>
                    ))}
                  </div>
                )}
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
                    Tabular view of respondent submissions, completion duration,
                    and attributes.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                      <span className="font-bold text-gray-900 text-sm">
                        Submissions Breakdown ({analytics.responseTable.length}{" "}
                        Rows Shown)
                      </span>
                    </div>
                  </div>

                  {analytics.responseTable.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <p className="text-sm text-gray-500">
                        No responses yet for this survey.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                            <th className="py-3 px-4">Response ID</th>
                            <th className="py-3 px-4">Submitted At</th>
                            <th className="py-3 px-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {analytics.responseTable.map((row) => (
                            <tr
                              key={row.id}
                              className="hover:bg-gray-50/80 transition-colors"
                            >
                              <td className="py-3 px-4 font-mono font-bold text-gray-900">
                                {row.responseId}
                              </td>
                              <td className="py-3 px-4 text-gray-500">
                                {row.submittedAt}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700">
                                  {row.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
