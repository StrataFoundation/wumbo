import React from "react";

interface IStatCardProps {
  label: string;
  value?: string;
}

export const StatCard = ({ label, value }: IStatCardProps) => {
  return (
    <div className="wum-flex wum-flex-col wum-bg-gray-100 wum-p-3 wum-rounded-lg wum-border-1 wum-space-y-2">
      <span className="wum-text-xs">{label}</span>
      <span className="wum-text-s">{value}</span>
    </div>
  );
};
