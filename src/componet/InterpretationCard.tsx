import React from "react";
import { Sparkles } from "lucide-react";

interface InterpretationCardProps {
  interpretation: string;
}

export const InterpretationCard: React.FC<InterpretationCardProps> = ({
  interpretation,
}) => {
  return (
    <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2.5 bg-gray-50/80 rounded-xl p-3">
      <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">
          AI Insight & Interpretation
        </p>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
          {interpretation}
        </p>
      </div>
    </div>
  );
};
