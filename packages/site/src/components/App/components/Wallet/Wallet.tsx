import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFtxPayLink } from "@strata-foundation/react";
import { Wallet } from "wumbo-common";
import {
  AppRoutes,
  profilePath,
  swapPath,
  wumNetWorthPath,
} from "../../../../constants/routes";
import { AppContainer } from "../common/AppContainer";
import WalletRedirect from "./WalletRedirect";

export default React.memo(() => {
  const solLink = useFtxPayLink();
  const { adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  return (
    <AppContainer>
      <WalletRedirect />
      <Wallet
        wumLeaderboardLink={publicKey ? wumNetWorthPath(publicKey) : ""}
        getTokenLink={(t) =>
          t.tokenRef
            ? profilePath(t.tokenRef.mint)
            : t.tokenBonding
            ? swapPath(
                t.tokenBonding.publicKey,
                t.tokenBonding.baseMint,
                t.tokenBonding.targetMint
              )
            : null
        }
        solLink={solLink}
        sendLink={AppRoutes.sendSearch.path}
      />
    </AppContainer>
  );
});
