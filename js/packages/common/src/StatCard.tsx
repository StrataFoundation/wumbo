import React from "react";
import CoinIcon from "./svgs/stat_coin.svg";
import WumboIcon from "./svgs/stat_wumbo.svg";

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
  <div className="flex p-2 border-1 border-gray-100">
    <div>
      {icon === "coin" && <CoinIcon />}
      {icon === "wumbo" && <WumboIcon />}
    </div>
    <div className="flex-1 flex flex-col">
      <span className="text-md">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  </div>
);
