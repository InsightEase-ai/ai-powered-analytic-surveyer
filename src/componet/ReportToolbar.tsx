import React from "react";
import { Download, FileSpreadsheet, FileText, RefreshCw } from "lucide-react";

interface ReportToolbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onDownloadReport?: () => void;
  onExportPdf?: () => void;
  onExportCsv?: () => void;
  exportsDisabled?: boolean;
}

export const ReportToolbar: React.FC<ReportToolbarProps> = ({
  onRefresh,
  isRefreshing = false,
  onDownloadReport,
  onExportPdf,
  onExportCsv,
  exportsDisabled = false,
}) => {
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
          onClick={onDownloadReport}
          disabled={exportsDisabled}
          className="inline-flex items-center gap-2 bg-[#0B192C] text-white px-3.5 py-2 rounded-xl text-xs font-medium hover:bg-[#152a40] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5 text-teal-400" />
          Download DOCX Report
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={exportsDisabled}
          className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:text-teal-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-3.5 h-3.5 text-rose-500" />
          Export PDF
        </button>

        <button
          type="button"
          onClick={onExportCsv}
          disabled={exportsDisabled}
          className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:text-teal-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          Export CSV
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing || exportsDisabled}
          className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 hover:border-gray-300 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
