import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import AppContainer from "../common/AppContainer";
import routes, { swapPath } from "../../constants/routes";
import { PluggableSwap } from "@strata-foundation/react";

export const SwapRoute = React.memo(() => {
  const history = useHistory();
  const location = useLocation();

  return (
    <AppContainer>
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
    </AppContainer>
  );
});
