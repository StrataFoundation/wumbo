import React, { ReactNode } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import { classNames } from "./utils/utils";

export interface INotificationsProps {
  children?: ReactNode;
  className?: string;
}

export interface INotificationProps {
  type: "warning" | "info" | "success" | "error";
  heading: string;
  show: boolean;
  className?: string;
  message?: string;
  size?: "xs" | "sm" | "md" | "lg";
  rounded?: boolean;
  shadow?: boolean;
  onDismiss?: () => void;
}

/*
 ** Basic Notification
 ** extendable if we need more functionality
 ** https://tailwindui.com/components/application-ui/overlays/notifications
 */
export const Notification = ({
  type,
  heading,
  show,
  message,
  size = "md",
  rounded = false,
  shadow = false,
  onDismiss,
  className,
}: INotificationProps) => {
  return (
    <div
      className={classNames(
        className,
        show ? "animate-enter" : "animate-leave",
        rounded && "rounded-lg",
        shadow && "shadow-lg",
        "max-w-sm w-full bg-white pointer-events-auto ring-1 ring-black ring-opacity-5"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {(() => {
              switch (type) {
                case "success":
                  return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
                case "error":
                  return <XCircleIcon className="h-6 w-6 text-red-400" />;
                case "warning":
                  return <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" />;
                case "info":
                  return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
                default:
                  return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
              }
            })()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{heading}</p>
            {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
          </div>
          {onDismiss && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onDismiss}
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
