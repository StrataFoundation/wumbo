import React, { Fragment } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { PluggableSwap, usePublicKey, Notification, useTokenBonding, useTokenBondingFromMint } from "@strata-foundation/react";
import { swapPath, AppRoutes } from "../../../../constants/routes";

import toast from "react-hot-toast";

export const SwapRoute = () => {
  const history = useHistory();
  const location = useLocation();
  const query = useParams<{ tokenBondingKey: string, action: "buy" | "sell"}>();
  const tokenBondingKey = usePublicKey(query.tokenBondingKey)
  const { info: tokenBonding } = useTokenBonding(tokenBondingKey);
  const { info: baseTokenBonding } = useTokenBondingFromMint(
    tokenBonding?.baseMint
  );

  return (
    <PluggableSwap
      action={query.action}
      tokenBondingKey={tokenBondingKey!}
      onConnectWallet={() => {
        history.push(
          AppRoutes.manageWallet.path +
          `?redirect=${location.pathname}${location.search}`
        );
      }}
      onFlipTokens={(tokenBonding, action) => {
        history.push(swapPath(tokenBonding, action));
      }}
      onBuyBase={(tokenBonding) => {
        if (baseTokenBonding) {
          history.push(swapPath(baseTokenBonding.publicKey, "buy"));
        }
      }}
      onSuccess={({ ticker, mint, amount }) => {
        toast.custom((t) => (
          <Notification
            show={t.visible}
            type="success"
            heading="Transaction Succesful"
            message={`You now own ${Number(amount).toFixed(4)} of ${ticker}`}
            onDismiss={() => toast.dismiss(t.id)}
          />
        ));
      }}
    />
  );
};
