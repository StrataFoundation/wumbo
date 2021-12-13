import { swapPath } from "@/constants/routes";
import { usePublicKey } from "@strata-foundation/react";
import React, { Fragment } from "react";
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
  console.log(location);

  return (
    <Fragment>
      <WumboDrawer.Header title="Trade" />
      <WumboDrawer.Content>
        <Swap
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
