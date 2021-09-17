import React from "react";
import { RiCoinLine } from "react-icons/ri";
import wumboIcon from "./svgs/wumbo-indigo.svg";

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
  <div className="flex gap-2 px-2.5 py-2.5 rounded-lg border-2 border-gray-100 items-center justify-center">
    <div className="flex w-5 justify-center">
      {icon === "coin" && <RiCoinLine className="text-yellow-500" size="26" />}
      {icon === "wumbo" && <img className="w-full" src={wumboIcon} />}
    </div>
    <div className="flex-1 flex flex-col leading-none">
      <span className="text-md">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  </div>
);
