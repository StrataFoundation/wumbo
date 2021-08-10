import React, { ReactNode } from "react";

/*
 ** Basic Alert
 ** extendable if we need more functionality
 ** https://tailwindui.com/components/application-ui/feedback/alerts
 */

interface AlertProps {
  type: "warning" | "info" | "success" | "error" | "primary";
  icon?: boolean;
  message: string;
}

const style = {
  default: "wum-rounded-md wum-p-3",
  primary: {
    bg: "wum-bg-purple-50",
    text: "wum-bg-purple-700",
  },
  warning: {
    bg: "wum-bg-yellow-50",
    text: "wum-text-yellow-400",
  },
  info: {
    bg: "wum-bg-blue-50",
    text: "wum-text-blue-700",
  },
  success: {
    bg: "wum-bg-green-50",
    text: "wum-text-green-700",
  },
  error: {
    bg: "wum-bg-red-200",
    text: "wum-text-red-600",
  },
};

export const Alert = ({ type, message, icon = false }: AlertProps) => (
  <div className={`${style.default} ${style[type].bg}`}>
    <p className={`wum-text-sm ${style[type].text}`}>{message}</p>
  </div>
);
