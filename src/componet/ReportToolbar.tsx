import React from "react";
import { Download, FileSpreadsheet, FileText, RefreshCw } from "lucide-react";

interface ReportToolbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ReportToolbar: React.FC<ReportToolbarProps> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  const handleDownloadReport = () => {
    // TODO: Trigger comprehensive PDF/Executive Analytics Report compilation
    console.log("[TODO] Downloading full analytics report...");
    alert("[Placeholder] Generating & downloading full Analytics Report...");
  };

  const handleExportPDF = () => {
    // TODO: Export current analytics view as PDF
    console.log("[TODO] Exporting Analytics as PDF...");
    alert("[Placeholder] Exporting PDF...");
  };

  const handleExportCSV = () => {
    // TODO: Export raw survey responses dataset as CSV file
    console.log("[TODO] Exporting raw data as CSV...");
    alert("[Placeholder] Exporting survey response data as CSV...");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 p-3 sm:px-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
        <span className="text-xs font-semibold text-gray-700">
          Analytics Actions & Exports
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleDownloadReport}
          className="inline-flex items-center gap-2 bg-[#0B192C] text-white px-3.5 py-2 rounded-xl text-xs font-medium hover:bg-[#152a40] transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-teal-400" />
          Download Analytics Report
        </button>

        <button
          type="button"
          onClick={handleExportPDF}
          className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:text-teal-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-rose-500" />
          Export PDF
        </button>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:text-teal-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          Export CSV
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 hover:border-gray-300 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-gray-500 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
};
