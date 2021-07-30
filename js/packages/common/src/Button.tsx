import React, {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ForwardedRef,
  forwardRef,
  ReactNode,
} from "react";
import { classNames } from "./utils/utils";

interface ButtonPropsWithChildren {}

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonPropsWithChildren {
  block?: Boolean;
  children?: ReactNode;
  className?: string;
  color?: "primary" | "secondary" | "twitterBlue";
  disabled?: boolean;
  outline?: boolean;
  gradient?: boolean;
  rounded?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  submit?: boolean;
}

interface ILinkButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    ButtonPropsWithChildren {
  block?: Boolean;
  children?: ReactNode;
  className?: string;
  color?: "primary" | "secondary" | "twitterBlue";
  disabled?: boolean;
  outline?: boolean;
  gradient?: boolean;
  rounded?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  submit?: boolean;
}

type ButtonRef = ForwardedRef<HTMLButtonElement>;
type LinkButtonRef = ForwardedRef<HTMLAnchorElement>;

const style = {
  default: `text-white focus:outline-none shadow font-medium transition ease-in duration-200`,
  block: `flex justify-center items-center w-full`,
  rounded: `rounded-full`,
  disabled: `opacity-60 cursor-not-allowed`,
  sizes: {
    xs: "px-2 py-1 text-xs",
    sm: "px-6 py-1 text-sm",
    md: "px-6 py-2",
    lg: "px-6 py-2.5",
  },
  color: {
    primary: {
      bg: `bg-indigo-600 hover:bg-indigo-800`,
      gradient: `bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-indigo-800 hover:to-purple-800`,
      outline: `border-indigo-600 border-1 text-indigo-600 active:bg-indigo-600 active:text-white hover:bg-indigo-600 hover:bg-opacity-10`,
    },
    secondary: {
      bg: `bg-green-400 hover:bg-green-600`,
      gradient: `bg-gradient-to-tr from-green-400 to-green-600 hover:from-green-500 hover:to-green-700`,
      outline: `border-green-400 border-1 text-green-400 active:bg-green-400 active:text-white hover:bg-green-400 hover:bg-opacity-10`,
    },
    twitterBlue: {
      bg: `bg-twitter`,
      gradient: `bg-gradient-to-tr from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700`,
      outline: `border-indigo-500 border-1 text-indigo-500 active:bg-indigo-500 active:text-white hover:bg-indigo-500 hover:bg-opacity-10`,
    },
  },
};

const colors = (outline: boolean, gradient: boolean) => ({
  primary: outline
    ? style.color.primary.outline
    : gradient
    ? style.color.primary.gradient
    : style.color.primary.bg,
  secondary: outline
    ? style.color.secondary.outline
    : gradient
    ? style.color.secondary.gradient
    : style.color.secondary.bg,
  twitterBlue: outline
    ? style.color.twitterBlue.outline
    : gradient
    ? style.color.twitterBlue.gradient
    : style.color.twitterBlue.bg,
});

export const Button = forwardRef(
  (
    {
      block = false,
      children,
      className,
      color,
      disabled = false,
      outline,
      gradient,
      rounded,
      size = "md",
      submit,
      ...props
    }: IButtonProps,
    ref: ButtonRef
  ) => (
    <button
      ref={ref}
      {...props}
      type={submit ? "submit" : "button"}
      disabled={disabled}
      className={classNames(
        className,
        block && style.block,
        disabled && style.disabled,
        style.sizes[size],
        style.default,
        rounded ? style.rounded : "rounded-md",
        color
          ? colors(!!outline, !!gradient)[color]
          : colors(false, false)["primary"]
      )}
    >
      {children}
    </button>
  )
);

export const LinkButton = forwardRef(
  (
    {
      block = false,
      children,
      className,
      color,
      disabled = false,
      outline,
      gradient,
      rounded,
      size = "md",
      submit,
      ...props
    }: ILinkButtonProps,
    ref: LinkButtonRef
  ) => (
    <a
      ref={ref}
      {...props}
      type={submit ? "submit" : "button"}
      className={classNames(
        className,
        block && style.block,
        disabled && style.disabled,
        style.sizes[size],
        style.default,
        rounded ? style.rounded : "rounded-md",
        color
          ? colors(!!outline, !!gradient)[color]
          : colors(false, false)["primary"],
        "text-center"
      )}
    >
      {children}
    </a>
  )
);
