import React, { ReactNode } from "react";
import { classNames } from "./utils/utils";

/*
 ** Basic Badge
 ** extendable if we need more functionality
 ** https://tailwindui.com/components/application-ui/elements/badges
 */

interface BadgeProps {
  className?: string;
  color?:
    | "primary"
    | "secondary"
    | "warning"
    | "info"
    | "success"
    | "error"
    | "neutral";
  size?: "sm" | "lg";
  children: ReactNode;
  onClick?: () => void;
  rounded?: boolean;
  hoverable?: boolean;
}

const style = {
  default: `inline-flex items-center px-1.5 py-1 font-medium rounded`,
  hover: `cursor-pointer`,
  rounded: `!rounded-full`,
  sizes: {
    sm: "text-xs",
    lg: "text-sm",
  },
  color: {
    primary: {
      default: `bg-indigo-200 text-indigo-600`,
      hover: `hover:bg-indigo-300 hover:text-indigo-700`,
    },
    secondary: {
      default: `bg-green-400 text-green-600`,
      hover: `hover:bg-green-500 hover:text-green-700`,
    },
    warning: {
      default: `bg-yellow-100 text-yellow-800`,
      hover: `hover:bg-yellow-200 hover:text-hellow-900`,
    },
    info: {
      default: `bg-blue-100 text-blue-800`,
      hover: `hover:bg-blue-200 hover:text-blue-900`,
    },
    success: {
      default: `bg-green-100 text-green-800`,
      hover: `hover:bg-green-200 hover:text-green-900`,
    },
    error: {
      default: `bg-red-100 text-red-800`,
      hover: `hover:bg-red-200 hover:text-red-900`,
    },
    neutral: {
      default: `bg-gray-100 text-gray-800`,
      hover: `hover:bg-gray-200 hover:text-graya-900`,
    },
  },
};

export const Badge = ({
  className,
  color = "neutral",
  size = "lg",
  children,
  onClick,
  rounded = false,
  hoverable = false,
}: BadgeProps) => (
  <span
    className={classNames(
      style.default,
      rounded && style.rounded,
      style.sizes[size],
      style.color[color].default,
      (hoverable || onClick) && style.hover,
      (hoverable || onClick) && style.color[color].hover,
      className && className
    )}
    {...(onClick && { onClick: onClick })}
  >
    {children}
  </span>
);
