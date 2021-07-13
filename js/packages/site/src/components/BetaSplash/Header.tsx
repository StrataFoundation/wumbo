import React from "react";
import { ReactComponent as Logo } from "../../assets/images/logo.svg";
import { Button } from "wumbo-common";
import TwitterClaimButton from "./TwitterClaimButton";
import twitterLogo from "../../assets/images/social/twitter-white@3x.png";

const Header: React.FC = () => (
  <div
    className="flex flex-row items-center justify-between px-4 py-6 md:px-10"
    style={{
      background: `linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.28)`,
    }}
  >
    <div className="flex flex-row items-center">
      <Logo className="mr-4" width="40" height="40" />
      <p className="text-xl">Wum.bo</p>
    </div>

    <TwitterClaimButton />
    {/* <p className="text-xs md:text-sm">Beta sign up coming soon</p> */}
  </div>
);

export default Header;
