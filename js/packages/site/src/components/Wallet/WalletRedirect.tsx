import React from "react";
import { Redirect, useLocation } from "react-router";
import { useWallet } from "wumbo-common";
import routes from "../../constants/routes";

export default React.memo(() => {
  const location = useLocation();
  const { wallet, connected } = useWallet();

  const redirectUri =
    routes.wallet.path + `?redirect=${location.pathname}${location.search}`;

  if (!connected) {
    return <Redirect to={redirectUri} />;
  }

  return null;
});
