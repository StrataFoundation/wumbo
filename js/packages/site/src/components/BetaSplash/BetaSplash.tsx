import React from "react";
import Header from "../common/Header";
import Content from "./Content";
import Footer from "../common/Footer";
import TwitterButton from "./TwitterButton";
import { useHistory } from "react-router-dom";
import { useLocalStorageState } from "@oyster/common";
import { useClaimLink } from "wumbo-common";
import routes from "../../constants/routes";

const BetaSplash: React.FC = () => {
  const { claim } = useClaimLink({ handle: "" });

  return (
    <div
      className="flex flex-col min-h-screen font-sans font-medium text-white"
      style={{
        background: `
        linear-gradient(147deg, rgba(0, 0, 0, 0.28) 15%, rgba(0, 0, 0, 0.32) 129%),
        linear-gradient(56deg, #2323ff -25%, #4f51ff 20%, #a53ef4 84%)
      `,
      }}
    >
      <Header>
        <TwitterButton onClick={claim}>Beta Sign Up</TwitterButton>
      </Header>
      <Content />
      <div
        style={{
          background: "rgba(35, 35, 35, 0.28)",
        }}
      >
        <Footer />
      </div>
    </div>
  );
};

export default BetaSplash;
