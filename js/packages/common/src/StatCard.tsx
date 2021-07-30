import React from 'react';

interface IStatCardProps {
  label: string;
  value?: string;
}

export const StatCard = ({ label, value }: IStatCardProps) => {
  return <div className="flex flex-col bg-gray-100 p-3 rounded-lg border-1 space-y-2">
    <span className="text-xs">{ label }</span>
    <span className="text-s">{ value }</span>
  </div>
}