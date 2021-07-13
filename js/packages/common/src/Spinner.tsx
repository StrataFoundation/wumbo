import React from "react";
import { classNames } from "./utils/utils";

interface SpinnerProps {
  color?: "primary" | "secondary" | "white";
  size?: "xs" | "sm" | "md" | "lg";
}

const style = {
  sizes: {
    xs: "h-2 w-2",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  },
  color: {
    primary: "text-purple-700",
    secondary: "text-green-400",
    white: "text-white",
  },
};

export const Spinner = ({ color = "white", size = "sm" }: SpinnerProps) => (
  <div>
    <svg
      className={classNames(
        "animate-spin",
        style.sizes[size],
        style.color[color]
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);
