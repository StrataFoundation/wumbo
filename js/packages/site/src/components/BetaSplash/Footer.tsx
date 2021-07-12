import React from "react";
import twitterLogo from "../../assets/images/social/twitter-white@3x.png";
import discordLogo from "../../assets/images/social/discord-white@3x.png";

const Footer: React.FC = () => (
  <div
    className="flex flex-col items-center pt-10 pb-24"
    style={{
      background: "rgba(35, 35, 35, 0.28)",
    }}
  >
    <p className="mb-4">Other ways to stay connected</p>
    <div className="flex flex-row justify-center">
      <a target="_blank" rel="noreferrer" href="https://twitter.com/teamwumbo">
        <img className="mr-2" src={twitterLogo} alt="twitter" width="30" />
      </a>
      <a target="_blank" rel="noreferrer" href="https://discord.gg/S8wJBR2BQV">
        <img className="ml-2" src={discordLogo} alt="discord" width="30" />
      </a>
    </div>
  </div>
);

export default Footer;
