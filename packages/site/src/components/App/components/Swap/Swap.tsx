import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { AppRoutes, swapPath } from "../../../../constants/routes";
import { Swap } from "wumbo-common";

export const SwapRoute = React.memo(() => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Swap
      onHandleConnectWallet={() => {
        history.push(
          AppRoutes.manageWallet.path +
            `?redirect=${location.pathname}${location.search}`
        );
      }}
      onHandleFlipTokens={(tokenBonding, action) => {
        history.push(swapPath(tokenBonding, action));
      }}
      onHandleBuyBase={(tokenBonding) => {
        history.push(swapPath(tokenBonding, "buy"));
      }}
    />
  );
});
