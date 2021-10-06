import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import AppContainer from "../common/AppContainer";
import routes, { swapPath } from "../../constants/routes";
import { Swap } from "wumbo-common";

export const SwapRoute = React.memo(() => {
  const history = useHistory();
  const location = useLocation();

  return (
    <AppContainer>
      <Swap
        onHandleConnectWallet={() => {
          history.push(
            routes.manageWallet.path +
              `?redirect=${location.pathname}${location.search}`
          );
        }}
        onHandleFlipTokens={(tokenBonding, action) =>
          history.push(swapPath(tokenBonding, action))
        }
      />
    </AppContainer>
  );
});
