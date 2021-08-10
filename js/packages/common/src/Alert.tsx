import React from "react";

/*
 ** Basic Alert
 ** extendable if we need more functionality
 ** https://tailwindui.com/components/application-ui/feedback/alerts
 */

export interface IAlertProps {
  type: "warning" | "info" | "success" | "error" | "primary";
  icon?: boolean;
  message: string;
}

const style = {
  default: "rounded-md p-3",
  primary: {
    bg: "bg-purple-50",
    text: "bg-purple-700",
  },
  warning: {
    bg: "bg-yellow-50",
    text: "text-yellow-400",
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  success: {
    bg: "bg-green-50",
    text: "text-green-700",
  },
  error: {
    bg: "bg-red-200",
    text: "text-red-600",
  },
};

export const Alert = ({ type, message, icon = false }: IAlertProps) => (
  <div className={`${style.default} ${style[type].bg}`}>
    <p className={`text-sm ${style[type].text}`}>{message}</p>
  </div>
);
