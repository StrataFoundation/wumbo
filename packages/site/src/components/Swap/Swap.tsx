import React from "react";
import { useHistory, useLocation } from "react-router-dom";

export const SwapRoute = React.memo(() => {
  const history = useHistory();
  const location = useLocation();

  return (
    <div>
      {/* <PluggableSwap
      action=
        tokenBondingKey={}
        onConnectWallet={() => {
          history.push(
            routes.manageWallet.path +
              `?redirect=${location.pathname}${location.search}`
          );
        }}
        onFlipTokens={(tokenBonding, action) => {
          history.push(swapPath(tokenBonding, action));
        }}
        onBuyBase={(tokenBonding) => {
          history.push(swapPath(tokenBonding, "buy"));
        }}
      /> */}
    </div>
  );
});
