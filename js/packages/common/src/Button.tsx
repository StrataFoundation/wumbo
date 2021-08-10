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
  default: `wum-text-white focus:wum-outline-none wum-shadow wum-font-medium wum-transition wum-ease-in wum-duration-200`,
  block: `wum-flex wum-justify-center wum-items-center wum-w-full`,
  rounded: `wum-rounded-full`,
  disabled: `wum-opacity-60 wum-cursor-not-allowed`,
  sizes: {
    xs: "wum-px-2 wum-py-1 wum-text-xs",
    sm: "wum-px-6 wum-py-1 wum-text-sm",
    md: "wum-px-6 wum-py-2",
    lg: "wum-px-6 wum-py-2.5",
  },
  color: {
    primary: {
      bg: `wum-bg-indigo-600 hover:wum-bg-indigo-800`,
      gradient: `wum-bg-gradient-to-tr wum-from-blue-600 wum-via-indigo-600 wum-to-purple-600 hover:wum-from-indigo-800 hover:wum-to-purple-800`,
      outline: `wum-border-indigo-600 wum-border-1 wum-text-indigo-600 active:wum-bg-indigo-600 active:wum-text-white hover:wum-bg-indigo-600 hover:wum-bg-opacity-10`,
    },
    secondary: {
      bg: `wum-bg-green-400 hover:wum-bg-green-600`,
      gradient: `wum-bg-gradient-to-tr wum-from-green-400 wum-to-green-600 hover:wum-from-green-500 hover:wum-to-green-700`,
      outline: `wum-border-green-400 wum-border-1 wum-text-green-400 active:wum-bg-green-400 active:wum-text-white hover:wum-bg-green-400 hover:wum-bg-opacity-10`,
    },
    twitterBlue: {
      bg: `wum-bg-twitter`,
      gradient: `wum-bg-gradient-to-tr wum-from-blue-500 wum-via-indigo-500 wum-to-indigo-600 hover:wum-from-blue-600 hover:wum-to-indigo-700`,
      outline: `wum-border-indigo-500 wum-border-1 wum-text-indigo-500 active:wum-bg-indigo-500 active:wum-text-white hover:wum-bg-indigo-500 hover:wum-bg-opacity-10`,
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
        rounded ? style.rounded : "wum-rounded-md",
        color ? colors(!!outline, !!gradient)[color] : colors(false, false)["primary"]
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
        rounded ? style.rounded : "wum-rounded-md",
        color ? colors(!!outline, !!gradient)[color] : colors(false, false)["primary"],
        "wum-text-center"
      )}
    >
      {children}
    </a>
  )
);
