import { usePublicKey } from "@strata-foundation/react";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Swap } from "wumbo-common";
import { swapPath } from "../../../../constants/routes";

export const SwapRoute = () => {
  const history = useHistory();
  const query = useParams<{
    tokenBondingKey: string;
    baseMint: string;
    targetMint: string;
  }>();
  const tokenBondingKey = usePublicKey(query.tokenBondingKey);
  const baseMint = usePublicKey(query.baseMint);
  const targetMint = usePublicKey(query.targetMint);

  return (
    <Swap
      tokenBonding={tokenBondingKey}
      baseMint={baseMint}
      targetMint={targetMint}
      onTradingMintsChange={({ base, target }) =>
        history.push(swapPath(tokenBondingKey!, base, target))
      }
    />
  );
};
