import React, { useState, useRef, useEffect } from "react";
import { Download, Image as ImageIcon, FileCode, FileText, Copy, Check } from "lucide-react";

interface DownloadMenuProps {
  chartTitle: string;
}

export const DownloadMenu: React.FC<DownloadMenuProps> = ({ chartTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadPNG = () => {
    // TODO: Implement actual PNG chart export using html2canvas or recharts SVG canvas exporter
    console.log(`[TODO] Exporting chart "${chartTitle}" as PNG...`);
    alert(`[Placeholder] Downloading "${chartTitle}" as PNG...`);
    setIsOpen(false);
  };

  const handleDownloadSVG = () => {
    // TODO: Implement actual SVG chart export by serializing recharts SVG DOM node
    console.log(`[TODO] Exporting chart "${chartTitle}" as SVG...`);
    alert(`[Placeholder] Downloading "${chartTitle}" as SVG...`);
    setIsOpen(false);
  };

  const handleDownloadPDF = () => {
    // TODO: Implement actual PDF report export using jspdf or html2pdf
    console.log(`[TODO] Exporting chart "${chartTitle}" as PDF...`);
    alert(`[Placeholder] Downloading "${chartTitle}" as PDF...`);
    setIsOpen(false);
  };

  const handleCopyImage = () => {
    // TODO: Implement copying chart image to clipboard using Clipboard API
    console.log(`[TODO] Copying chart "${chartTitle}" to clipboard...`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-transparent hover:border-gray-200"
        title="Download options"
        aria-expanded={isOpen}
      >
        <Download className="w-4 h-4 text-gray-600" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 text-xs">
          <div className="px-3 py-1.5 font-bold text-[10px] tracking-wider text-gray-400 uppercase border-b border-gray-100">
            Export Options
          </div>
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
          >
            <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
            Download PNG
          </button>
          <button
            type="button"
            onClick={handleDownloadSVG}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            Download SVG
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            Download PDF
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            onClick={handleCopyImage}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-teal-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-500" />
            )}
            {copied ? "Copied!" : "Copy Image"}
          </button>
        </div>
      )}
    </div>
  );
};
