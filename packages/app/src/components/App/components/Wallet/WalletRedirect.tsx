import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";
import { Redirect, useLocation } from "react-router-dom";
import { AppRoutes } from "../../../../constants/routes";

export default React.memo(() => {
  const location = useLocation();
  const { connected } = useWallet();

  if (!connected) {
    return (
      <Redirect
        to={{
          pathname: AppRoutes.manageWallet.path,
          search: `?redirect=${location.pathname}${location.search}`,
        }}
      />
    );
  }

  return null;
});
