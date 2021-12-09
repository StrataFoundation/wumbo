import React, { Fragment } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import {
  PluggableSwap,
  usePublicKey,
  Notification,
} from "@strata-foundation/react";
import { routes, swapPath } from "@/constants/routes";
import toast from "react-hot-toast";
import { WumboDrawer } from "../WumboDrawer";

export const SwapRoute = () => {
  const history = useHistory();
  const location = useLocation();
  const query =
    useParams<{ tokenBondingKey: string; action: "buy" | "sell" }>();
  const tokenBondingKey = usePublicKey(query.tokenBondingKey);
  console.log(location);

  return (
    <Fragment>
      <WumboDrawer.Header title="Trade" />
      <WumboDrawer.Content>
        <PluggableSwap
          action={query.action}
          tokenBondingKey={tokenBondingKey!}
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
          onSuccess={({ ticker, mint, amount }) => {
            toast.custom((t) => (
              <Notification
                show={t.visible}
                type="success"
                heading="Transaction Succesful"
                message={`You now own ${Number(amount).toFixed(
                  4
                )} of ${ticker}`}
                onDismiss={() => toast.dismiss(t.id)}
              />
            ));
          }}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
