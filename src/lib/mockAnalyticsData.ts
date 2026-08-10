
export interface OverallAnalyticsStats {
  totalResponses: number;
  completionRate: number;
  numberOfQuestions: number;
  lastResponseDate: string;
}

export interface RecentActivityItem {
  id: string;
  respondent: string;
  completedAt: string;
  duration: string;
  status: "Completed" | "Partial";
}

export interface BarChartDataPoint {
  option: string;
  count: number;
  percentage: number;
}

export interface BarChartQuestion {
  id: string;
  questionTitle: string;
  questionType: string;
  totalAnswers: number;
  interpretation: string;
  data: BarChartDataPoint[];
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface PieChartQuestion {
  id: string;
  questionTitle: string;
  totalAnswers: number;
  interpretation: string;
  data: PieChartDataPoint[];
}

export interface LineChartTrendPoint {
  date: string;
  responses: number;
  completionRate: number;
}

export interface LineChartMetric {
  id: string;
  chartTitle: string;
  interpretation: string;
  data: LineChartTrendPoint[];
}

export interface ResponseTableRow {
  id: string;
  responseId: string;
  submittedAt: string;
  completionTime: string;
  userSegment: string;
  satisfactionScore: number;
  primaryRole: string;
  status: string;
}

export interface SurveyAnalyticsData {
  surveyId: string;
  surveyTitle: string;
  lastUpdated: string;
  stats: OverallAnalyticsStats;
  recentActivity: RecentActivityItem[];
  barCharts: BarChartQuestion[];
  pieCharts: PieChartQuestion[];
  lineCharts: LineChartMetric[];
  responseTable: ResponseTableRow[];
}

// Color palette matching design system
export const CHART_COLORS = {
  teal: "#0D9488",
  tealLight: "#14B8A6",
  navy: "#0B192C",
  blue: "#3B82F6",
  indigo: "#6366F1",
  amber: "#F59E0B",
  emerald: "#10B981",
  purple: "#8B5CF6",
  rose: "#F43F5E",
};

export const MOCK_ANALYTICS_DATA: Record<string, SurveyAnalyticsData> = {
  default: {
    surveyId: "default",
    surveyTitle: "Q3 Customer Feedback & Product Satisfaction Survey",
    lastUpdated: "Today at 10:45 AM",
    stats: {
      totalResponses: 1248,
      completionRate: 87.4,
      numberOfQuestions: 12,
      lastResponseDate: "Aug 7, 2026 at 10:42 AM",
    },
    recentActivity: [
      {
        id: "act-1",
        respondent: "Respondent #1248",
        completedAt: "2 mins ago",
        duration: "3m 12s",
        status: "Completed",
      },
      {
        id: "act-2",
        respondent: "Respondent #1247",
        completedAt: "8 mins ago",
        duration: "4m 05s",
        status: "Completed",
      },
      {
        id: "act-3",
        respondent: "Respondent #1246",
        completedAt: "15 mins ago",
        duration: "2m 50s",
        status: "Completed",
      },
      {
        id: "act-4",
        respondent: "Respondent #1245",
        completedAt: "24 mins ago",
        duration: "1m 30s",
        status: "Partial",
      },
      {
        id: "act-5",
        respondent: "Respondent #1244",
        completedAt: "35 mins ago",
        duration: "3m 48s",
        status: "Completed",
      },
    ],
    barCharts: [
      {
        id: "q1_bar",
        questionTitle:
          "Q1: How satisfied are you with the platform performance?",
        questionType: "Multiple Choice (Single Select)",
        totalAnswers: 1248,
        interpretation:
          "Over 76% of respondents rated platform performance as Very Satisfied or Satisfied. Performance optimisations deployed in July correlated with a 12% bump in Very Satisfied ratings.",
        data: [
          { option: "Very Satisfied", count: 540, percentage: 43.3 },
          { option: "Satisfied", count: 412, percentage: 33.0 },
          { option: "Neutral", count: 180, percentage: 14.4 },
          { option: "Dissatisfied", count: 86, percentage: 6.9 },
          { option: "Very Dissatisfied", count: 30, percentage: 2.4 },
        ],
      },
      {
        id: "q2_bar",
        questionTitle:
          "Q2: Which features do you use most frequently on a weekly basis?",
        questionType: "Multiple Choice (Multi Select)",
        totalAnswers: 1248,
        interpretation:
          "Analytics Dashboards and AI Insights are the top two drive features. Custom Export and User Permissions saw lower usage, pointing to opportunity for onboarding tours.",
        data: [
          { option: "Analytics Dashboards", count: 980, percentage: 78.5 },
          { option: "AI Insights", count: 845, percentage: 67.7 },
          { option: "Survey Builder", count: 710, percentage: 56.9 },
          { option: "Report Exports", count: 430, percentage: 34.5 },
          { option: "Automated Workflows", count: 310, percentage: 24.8 },
        ],
      },
      {
        id: "q3_bar",
        questionTitle:
          "Q3: How likely are you to recommend InsightEase to a colleague? (NPS)",
        questionType: "Net Promoter Score (1-10)",
        totalAnswers: 1248,
        interpretation:
          "NPS score sits at +48 (Promoters: 58%, Passives: 32%, Detractors: 10%). High loyalty is concentrated among team leads and data analysts.",
        data: [
          { option: "Promoters (9-10)", count: 724, percentage: 58.0 },
          { option: "Passives (7-8)", count: 399, percentage: 32.0 },
          { option: "Detractors (1-6)", count: 125, percentage: 10.0 },
        ],
      },
    ],
    pieCharts: [
      {
        id: "q4_pie",
        questionTitle: "Q4: Primary role of respondents in their organization",
        totalAnswers: 1248,
        interpretation:
          "Data Analysts and Product Managers account for over 60% of total response volume, indicating strong product-market fit with product and analytics teams.",
        data: [
          { name: "Data Analyst", value: 412, color: CHART_COLORS.teal },
          { name: "Product Manager", value: 350, color: CHART_COLORS.navy },
          { name: "UX Researcher", value: 240, color: CHART_COLORS.blue },
          { name: "Engineering Lead", value: 146, color: CHART_COLORS.amber },
          {
            name: "Executive / C-Level",
            value: 100,
            color: CHART_COLORS.purple,
          },
        ],
      },
      {
        id: "q5_pie",
        questionTitle: "Q5: Primary device used to complete surveys",
        totalAnswers: 1248,
        interpretation:
          "Desktop dominates completion at 65%, though Mobile Web has grown to 28%. Ensuring fluid responsive mobile survey layouts remains essential.",
        data: [
          { name: "Desktop Web", value: 811, color: CHART_COLORS.teal },
          { name: "Mobile Web", value: 349, color: CHART_COLORS.emerald },
          { name: "Tablet", value: 88, color: CHART_COLORS.indigo },
        ],
      },
      {
        id: "q6_pie",
        questionTitle: "Q6: Organization size category",
        totalAnswers: 1248,
        interpretation:
          "Mid-market (100-500 employee) and Enterprise (500+ employee) organizations compose 70% of respondents, matching core enterprise target profiles.",
        data: [
          { name: "Enterprise (500+)", value: 480, color: CHART_COLORS.navy },
          {
            name: "Mid-Market (100-500)",
            value: 395,
            color: CHART_COLORS.tealLight,
          },
          { name: "Growth (20-99)", value: 243, color: CHART_COLORS.amber },
          { name: "Startup (1-19)", value: 130, color: CHART_COLORS.rose },
        ],
      },
    ],
    lineCharts: [
      {
        id: "trend_1",
        chartTitle: "Daily Response Volume Trend (Last 14 Days)",
        interpretation:
          "Response volume peaked on Aug 3 following an email reminder broadcast. Mid-week response rates remain significantly higher than weekend submissions.",
        data: [
          { date: "Jul 25", responses: 42, completionRate: 84 },
          { date: "Jul 26", responses: 38, completionRate: 82 },
          { date: "Jul 27", responses: 65, completionRate: 86 },
          { date: "Jul 28", responses: 98, completionRate: 88 },
          { date: "Jul 29", responses: 110, completionRate: 89 },
          { date: "Jul 30", responses: 88, completionRate: 87 },
          { date: "Jul 31", responses: 45, completionRate: 83 },
          { date: "Aug 01", responses: 50, completionRate: 85 },
          { date: "Aug 02", responses: 120, completionRate: 90 },
          { date: "Aug 03", responses: 215, completionRate: 92 },
          { date: "Aug 04", responses: 165, completionRate: 89 },
          { date: "Aug 05", responses: 112, completionRate: 88 },
          { date: "Aug 06", responses: 70, completionRate: 86 },
          { date: "Aug 07", responses: 30, completionRate: 87 },
        ],
      },
      {
        id: "trend_2",
        chartTitle: "Completion Rate Trend % (Over Time)",
        interpretation:
          "Completion rate has maintained a healthy average above 85%. Minor drops on weekends correlate with higher mobile drop-off rates.",
        data: [
          { date: "Jul 25", responses: 42, completionRate: 84 },
          { date: "Jul 26", responses: 38, completionRate: 82 },
          { date: "Jul 27", responses: 65, completionRate: 86 },
          { date: "Jul 28", responses: 98, completionRate: 88 },
          { date: "Jul 29", responses: 110, completionRate: 89 },
          { date: "Jul 30", responses: 88, completionRate: 87 },
          { date: "Jul 31", responses: 45, completionRate: 83 },
          { date: "Aug 01", responses: 50, completionRate: 85 },
          { date: "Aug 02", responses: 120, completionRate: 90 },
          { date: "Aug 03", responses: 215, completionRate: 92 },
          { date: "Aug 04", responses: 165, completionRate: 89 },
          { date: "Aug 05", responses: 112, completionRate: 88 },
          { date: "Aug 06", responses: 70, completionRate: 86 },
          { date: "Aug 07", responses: 30, completionRate: 87 },
        ],
      },
    ],
    responseTable: [
      {
        id: "row-1",
        responseId: "RESP-1248",
        submittedAt: "2026-08-07 10:42",
        completionTime: "3m 12s",
        userSegment: "Enterprise",
        satisfactionScore: 5,
        primaryRole: "Data Analyst",
        status: "Completed",
      },
      {
        id: "row-2",
        responseId: "RESP-1247",
        submittedAt: "2026-08-07 10:36",
        completionTime: "4m 05s",
        userSegment: "Mid-Market",
        satisfactionScore: 4,
        primaryRole: "Product Manager",
        status: "Completed",
      },
      {
        id: "row-3",
        responseId: "RESP-1246",
        submittedAt: "2026-08-07 10:29",
        completionTime: "2m 50s",
        userSegment: "Growth",
        satisfactionScore: 5,
        primaryRole: "UX Researcher",
        status: "Completed",
      },
      {
        id: "row-4",
        responseId: "RESP-1245",
        submittedAt: "2026-08-07 10:20",
        completionTime: "1m 30s",
        userSegment: "Enterprise",
        satisfactionScore: 3,
        primaryRole: "Engineering Lead",
        status: "Partial",
      },
      {
        id: "row-5",
        responseId: "RESP-1244",
        submittedAt: "2026-08-07 10:09",
        completionTime: "3m 48s",
        userSegment: "Mid-Market",
        satisfactionScore: 4,
        primaryRole: "Data Analyst",
        status: "Completed",
      },
      {
        id: "row-6",
        responseId: "RESP-1243",
        submittedAt: "2026-08-07 09:55",
        completionTime: "5m 10s",
        userSegment: "Startup",
        satisfactionScore: 2,
        primaryRole: "Executive / C-Level",
        status: "Completed",
      },
      {
        id: "row-7",
        responseId: "RESP-1242",
        submittedAt: "2026-08-07 09:40",
        completionTime: "3m 00s",
        userSegment: "Enterprise",
        satisfactionScore: 5,
        primaryRole: "Product Manager",
        status: "Completed",
      },
    ],
  },
};

/**
 * Fetch analytics data for a given survey ID.
 * TODO: Replace with Convex query `useQuery(api.analytics.getSurveyAnalytics, { surveyId })`
 */
export function getMockAnalytics(surveyTitle?: string, surveyId?: string): SurveyAnalyticsData {
  const base = MOCK_ANALYTICS_DATA.default;
  if (surveyTitle || surveyId) {
    return {
      ...base,
      surveyId: surveyId || base.surveyId,
      surveyTitle: surveyTitle || base.surveyTitle,
    };
  }
  return base;
}
