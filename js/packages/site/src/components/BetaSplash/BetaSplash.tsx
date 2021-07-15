import React from "react";
import Header from "../common/Header";
import Content from "./Content";
import Footer from "../common/Footer";
import TwitterButton from "./TwitterButton";
import { useHistory } from "react-router-dom";
import { useLocalStorageState } from "@oyster/common";
import { auth0, auth0Options } from "wumbo-common";
import routes from "../../constants/routes";

function makeId(length: number): string {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
          charactersLength));
  }
  return result;
}

const BetaSplash: React.FC = () => {
  const setAuth0State = useLocalStorageState("auth0-state")[1];
  const state = makeId(6);

  function claim() {
    const redirectUri = `${window.location.origin.replace(/\/$/, "")}${routes.claim.path}`
    const auth0Url = auth0.client.buildAuthorizeUrl({
      ...auth0Options,
      scope: 'openid profile',
      redirectUri,
      responseType: 'code',
      state,
    })
    setAuth0State(state)
    window.location.href = auth0Url
  }

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
}

export default BetaSplash;
