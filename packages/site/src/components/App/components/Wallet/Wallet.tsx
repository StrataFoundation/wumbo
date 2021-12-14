import { Box } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFtxPayLink } from "@strata-foundation/react";
import React from "react";
import { Wallet } from "wumbo-common";
import {
  AppRoutes,
  profilePath,
  wumNetWorthPath,
} from "../../../../constants/routes";
import WalletRedirect from "./WalletRedirect";

export default React.memo(() => {
  const solLink = useFtxPayLink();
  const { adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  return (
    <>
      <WalletRedirect />
      <Wallet
        wumLeaderboardLink={publicKey ? wumNetWorthPath(publicKey) : ""}
        getTokenLink={(t) =>
          t.tokenRef?.publicKey ? profilePath(t.tokenRef?.publicKey) : ""
        }
        solLink={solLink}
        sendLink={AppRoutes.sendSearch.path}
      />
    </>
  );
});
