import React from "react";
import { usePublicKey } from "@strata-foundation/react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Swap } from "wumbo-common";
import { AppRoutes, swapPath } from "../../../../constants/routes";
import { AppContainer } from "../common/AppContainer";

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
    AppRoutes.manageWallet.path +
    `?redirect=${location.pathname}${location.search}`;

  return (
    <AppContainer>
      <Swap
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
