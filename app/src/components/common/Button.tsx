import React, {
  ButtonHTMLAttributes,
  ForwardedRef,
  forwardRef,
  ReactNode,
} from "react";
import { classNames } from "@/utils/utils";

interface ButtonPropsWithChildren {}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonPropsWithChildren {
  block?: Boolean;
  children: ReactNode;
  className?: string;
  color?: "primary" | "secondary";
  disabled?: boolean;
  outline?: boolean;
  gradient?: boolean;
  rounded?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  submit?: boolean;
}

type ButtonRef = ForwardedRef<HTMLButtonElement>;

const style = {
  default: `text-white focus:outline-none shadow font-medium transition ease-in duration-200`,
  block: `flex justify-center items-center w-full`,
  rounded: `rounded-full`,
  disabled: `opacity-60 cursor-not-allowed`,
  sizes: {
    xs: "px-2 py-1 text-xs",
    sm: "px-6 py-1 text-sm",
    md: "px-6 py-2",
    lg: "px-6 py-3",
  },
  color: {
    primary: {
      bg: `bg-indigo-600 hover:bg-indigo-800`,
      gradient: `bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-indigo-800 hover:to-purple-800`,
      outline: `border-purple-700 border-2 text-purple-700 active:bg-purple-700 active:text-white`,
    },
    secondary: {
      bg: `bg-green-400 hover:bg-green-600`,
      gradient: `bg-gradient-to-tr from-green-400 to-green-600 hover:from-green-500 hover:to-green-700`,
      outline: `border-green-400 border-2 text-green-400 active:bg-green-400 active:text-white`,
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
    }: ButtonProps,
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
