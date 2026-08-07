import React from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Clock, ChevronDown, BarChart3 } from "lucide-react";

interface SurveyOption {
  _id: string;
  title: string;
}

interface AnalyticsHeaderProps {
  title: string;
  responseCount: number;
  lastUpdated: string;
  status?: string;
  surveyId?: string;
  allSurveys?: SurveyOption[];
  onSelectSurvey?: (id: string) => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  title,
  responseCount,
  lastUpdated,
  surveyId,
  allSurveys = [],
  onSelectSurvey,
}) => {
  const navigate = useNavigate();

  const handleSurveyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (onSelectSurvey) {
      onSelectSurvey(selectedId);
    } else if (selectedId) {
      navigate(`/analytics?id=${selectedId}`);
    } else {
      navigate("/analytics");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          to={surveyId ? `/surveys/${surveyId}` : "/"}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Survey Management
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5 flex-1 max-w-2xl">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
              {title}
            </h1>
          </div>

          {/* Survey selector dropdown */}
          <div className="pt-1 flex items-center gap-2">
            <label htmlFor="survey-select" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              Select Survey:
            </label>
            <div className="relative inline-block w-full max-w-md">
              <select
                id="survey-select"
                value={surveyId || ""}
                onChange={handleSurveyChange}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
              >
                {allSurveys.length > 0 ? (
                  allSurveys.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title}
                    </option>
                  ))
                ) : (
                  <option value={surveyId || ""}>
                    {title}
                  </option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-gray-50/80 px-4 py-2.5 rounded-xl border border-gray-100 shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <span>
              <strong className="text-gray-900">{responseCount.toLocaleString()}</strong> Responses
            </span>
          </div>

          <div className="h-3 w-px bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>
              Updated <strong className="text-gray-900">{lastUpdated}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
