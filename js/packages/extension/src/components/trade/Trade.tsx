import React, { Fragment } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Swap } from "wumbo-common";
import { routes, tradePath } from "@/constants/routes";
import { WumboDrawer } from "../WumboDrawer";

export const TradeRoute = () => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Fragment>
      <WumboDrawer.Header title="Trade" />
      <WumboDrawer.Content>
        <Swap
          onHandleConnectWallet={() => {
            history.push(
              routes.manageWallet.path +
                `?redirec=${location.pathname}${location.search}`
            );
          }}
          onHandleFlipTokens={(tokenBonding, action) => {
            history.push(tradePath(tokenBonding, action));
          }}
          onHandleBuyBase={(tokenBonding) => {
            history.push(tradePath(tokenBonding, "buy"));
          }}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
