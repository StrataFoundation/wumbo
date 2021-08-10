import React, { ReactNode } from "react";
import { classNames } from "./utils/utils";

/*
 ** Basic Badge
 ** extendable if we need more functionality
 ** https://tailwindui.com/components/application-ui/elements/badges
 */

interface BadgeProps {
  className?: string;
  color?: "primary" | "secondary" | "warning" | "info" | "success" | "error" | "neutral";
  size?: "sm" | "lg";
  children: ReactNode;
  onClick?: () => void;
  rounded?: boolean;
  hoverable?: boolean;
}

const style = {
  default: `wum-inline-flex wum-items-center wum-px-1.5 wum-py-1 wum-font-medium wum-rounded`,
  hover: `wum-cursor-pointer`,
  rounded: `!wum-rounded-full`,
  sizes: {
    sm: "wum-text-xs",
    lg: "wum-text-sm",
  },
  color: {
    primary: {
      default: `wum-bg-indigo-200 wum-text-indigo-600`,
      hover: `hover:wum-bg-indigo-300 hover:wum-text-indigo-700`,
    },
    secondary: {
      default: `wum-bg-green-400 wum-text-green-600`,
      hover: `hover:wum-bg-green-500 hover:wum-text-green-700`,
    },
    warning: {
      default: `wum-bg-yellow-100 wum-text-yellow-800`,
      hover: `hover:wum-bg-yellow-200 hover:wum-text-hellow-900`,
    },
    info: {
      default: `wum-bg-blue-100 wum-text-blue-800`,
      hover: `hover:wum-bg-blue-200 hover:wum-text-blue-900`,
    },
    success: {
      default: `wum-bg-green-100 wum-text-green-800`,
      hover: `hover:wum-bg-green-200 hover:wum-text-green-900`,
    },
    error: {
      default: `wum-bg-red-100 wum-text-red-800`,
      hover: `hover:wum-bg-red-200 hover:wum-text-red-900`,
    },
    neutral: {
      default: `wum-bg-gray-100 wum-text-gray-800`,
      hover: `hover:wum-bg-gray-200 hover:wum-text-graya-900`,
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
