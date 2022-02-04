import React, { Fragment } from "react";
import { routes, swapPath } from "@/constants/routes";
import { usePublicKey } from "@strata-foundation/react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Swap } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";

export const SwapRoute = () => {
  const history = useHistory();
  const location = useLocation();
  const query = useParams<{
    tokenBondingKey: string;
    baseMint: string;
    targetMint: string;
  }>();
  const tokenBondingKey = usePublicKey(query.tokenBondingKey);
  const baseMint = usePublicKey(query.baseMint);
  const targetMint = usePublicKey(query.targetMint);

  const redirectUri =
    routes.manageWallet.path +
    `?redirect=${location.pathname}${location.search}`;

  return (
    <Fragment>
      <WumboDrawer.Header title="Trade" />
      <WumboDrawer.Content>
        <Swap
          swapConfirmationPath={routes.swapConfirmation.path}
          manageWalletPath={redirectUri}
          tokenBonding={tokenBondingKey}
          baseMint={baseMint}
          targetMint={targetMint}
          onTradingMintsChange={({ base, target }) =>
            history.push(swapPath(tokenBondingKey!, base, target))
          }
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
