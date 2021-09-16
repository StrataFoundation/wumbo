import React from "react";
import coinIcon from "./svgs/stat_coin.svg";
import wumboIcon from "./svgs/stat_wumbo.svg";

interface IStatCardProps {
  label: string;
  value?: string;
}

export const StatCard = ({ label, value }: IStatCardProps) => (
  <div className="flex flex-col bg-gray-100 p-3 rounded-lg">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-md">{value}</span>
  </div>
);

interface IStatCardWithIconProps extends IStatCardProps {
  icon: "coin" | "wumbo";
}

export const StatCardWithIcon = ({
  label,
  value,
  icon,
}: IStatCardWithIconProps) => (
  <div className="flex gap-2 p-2 rounded-lg border-2 border-gray-100 items-center">
    <div>
      {icon === "coin" && <img src={coinIcon} />}
      {icon === "wumbo" && <img src={wumboIcon} />}
    </div>
    <div className="flex-1 flex flex-col">
      <span className="text-md leading-sm">{value}</span>
      <span className="text-sm text-gray-500 leading-sm">{label}</span>
    </div>
  </div>
);
