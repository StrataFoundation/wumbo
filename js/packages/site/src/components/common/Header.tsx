import React from "react";
import { ReactComponent as Logo } from "../../assets/images/logo.svg";
import { classNames } from "wumbo-common";

const Header = ({
  children,
  gradient = true,
  size = "lg",
}: {
  children?: React.ReactElement;
  gradient?: boolean;
  size?: "lg" | "sm";
}) => (
  <div
    className={classNames(
      "flex flex-row items-center justify-between px-4 md:px-10",
      size == "lg" && "py-6",
      size == "sm" && "py-3"
    )}
    style={{
      background: gradient
        ? `linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.28)`
        : "",
    }}
  >
    <div className="flex flex-row items-center">
      <Logo className="mr-4" width="40" height="40" />
      <p className="text-xl">Wum.bo</p>
    </div>

    {children}
  </div>
);

export default Header;
