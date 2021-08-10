import React from "react";
import { classNames } from "./utils/utils";

export interface ISpinnerProps {
  color?: "primary" | "secondary" | "white";
  size?: "xs" | "sm" | "md" | "lg";
}

const style = {
  sizes: {
    xs: "wum-h-2 wum-w-2",
    sm: "wum-h-4 wum-w-4",
    md: "wum-h-6 wum-w-6",
    lg: "wum-h-8 wum-w-8",
  },
  color: {
    primary: "wum-text-indigo-600",
    secondary: "wum-text-green-400",
    white: "wum-text-white",
  },
};

export const Spinner = ({ color = "white", size = "sm" }: ISpinnerProps) => (
  <div>
    <svg
      className={classNames("wum-animate-spin", style.sizes[size], style.color[color])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="wum-opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="wum-opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);
