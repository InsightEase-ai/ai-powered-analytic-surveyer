import React from "react";
import { DownloadMenu } from "./DownloadMenu";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  action,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {action}
            <DownloadMenu chartTitle={title} />
          </div>
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};
