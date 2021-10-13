import React from "react";
import { Redirect, useLocation } from "react-router";
import { useWallet } from "wumbo-common";
import { AppRoutes } from "../../../../constants/routes";

export default React.memo(() => {
  const location = useLocation();
  const { connected } = useWallet();

  const redirectUri =
    AppRoutes.manageWallet.path +
    `?redirect=${location.pathname}${location.search}`;

  if (!connected) {
    return <Redirect to={redirectUri} />;
  }

  return null;
});
