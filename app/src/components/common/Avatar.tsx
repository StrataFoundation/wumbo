import React from "react";
import { classNames } from "@/utils/classNames";

/*
 ** Basic Avatar
 ** extendable if we need more functionality
 ** https://tailwindui.com/components/application-ui/elements/avatars
 */

interface AvatarProps {
  name: string;
  subText?: string;
  imgSrc?: string;
  rounded?: boolean;
  token?: boolean;
  showDetails?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

const style = {
  default: `inline-flex items-center justify-center rounded-full bg-gray-500 rounded-md`,
  rounded: "!rounded-full",
  token: "!bg-gradient-to-r !from-yellow-400 !to-red-400",
  sizes: {
    xs: {
      default: "h-8 w-8",
      text: "text-xs font-medium leading-none text-white",
    },
    sm: {
      default: "h-10 w-10",
      text: "text-sm font-medium leading-none text-white",
    },
    md: {
      default: "h-12 w-12",
      text: "font-medium leading-none text-white",
    },
    lg: {
      default: "h-14 w-14",
      text: "text-lg font-medium leading-none text-white",
    },
    xl: {
      default: "h-16 w-16",
      text: "text-xl font-medium leading-none text-white",
    },
  },
};

export const Avatar = ({
  name,
  subText,
  imgSrc,
  rounded = true,
  token = false,
  showDetails = false,
  size = "md",
}: AvatarProps) => (
  <div className="flex items-center">
    {imgSrc && (
      <img
        src={imgSrc}
        className={classNames(
          style.default,
          rounded && style.rounded,
          style.sizes[size].default
        )}
      />
    )}
    {!imgSrc && (
      <span
        className={classNames(
          style.default,
          rounded && style.rounded,
          token && style.token,
          style.sizes[size].default
        )}
      >
        <span className={style.sizes[size].text}>
          {name.substr(0, 2).toUpperCase()}
        </span>
      </span>
    )}
    {showDetails && (
      <div className="ml-3">
        <p className="font-medium text-gray-700">{name}</p>
        {subText && (
          <p className="text-xs font-medium text-gray-700">{subText}</p>
        )}
      </div>
    )}
  </div>
);
