import React from "react";
import BetaButton from "./BetaButton";
import SubscribeForm from "./SubscribeForm";

const Content: React.FC = () => (
  <div className="flex flex-grow py-10 md:px-10">
    <div className="flex items-center w-screen px-4 bg-right bg-no-repeat bg-contain md:px-0 bg-beta-splash-hero-pattern">
      <div>
        <p className="text-4xl mb-9 md:text-7xl">Like. Share. Grow.</p>
        <div className="mb-9">
          <p className="text-md md:w-8/12">
            Wum.bo is a platform that brings Creator Coins directly to the
            networks (twitter, twitch, reddit..etc) where creators interact with
            their fans. Our Creator Coins give each creator their own personal,
            customizable cryptocurrency.{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://teamwumbo.medium.com/wum-bo-hello-world-hello-twitter-fa3a7b8b6957"
              className="underline"
            >
              Learn More..
            </a>
          </p>
        </div>
        <BetaButton colorScheme="green" />
      </div>
    </div>
  </div>
);

export default Content;
