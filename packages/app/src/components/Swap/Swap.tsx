import React from "react";
import { usePublicKey } from "@strata-foundation/react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Swap } from "wumbo-common";
import { Routes, swapPath } from "../../constants/routes";
import { AppContainer } from "../AppContainer";

export const SwapRoute: React.FC = () => {
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
    Routes.manageWallet.path +
    `?redirect=${location.pathname}${location.search}`;

  return (
    <AppContainer>
      <Swap
        swapConfirmationPath={Routes.swapConfirmation.path}
        manageWalletPath={redirectUri}
        tokenBonding={tokenBondingKey}
        baseMint={baseMint}
        targetMint={targetMint}
        onTradingMintsChange={({ base, target }) =>
          history.push(swapPath(tokenBondingKey!, base, target))
        }
      />
    </AppContainer>
  );
};
