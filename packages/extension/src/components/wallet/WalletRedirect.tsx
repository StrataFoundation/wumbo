import React from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { routes } from "../../constants/routes";

export default React.memo(() => {
  const location = useLocation();
  const { connected } = useWallet();
  const redirectUri =
    routes.manageWallet.path +
    `?redirect=${location.pathname}${location.search}`;

  if (!connected) {
    return <Redirect to={redirectUri} />;
  }

  return null;
});
