import { Box } from "@chakra-ui/react";
import React, { Fragment } from "react";
import {
  viewProfilePath,
  swapPath,
  wumNetWorthPath,
  routes,
} from "@/constants/routes";
import { Wallet as CommonWallet } from "wumbo-common";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFtxPayLink } from "@strata-foundation/react";
import { WumboDrawer } from "../WumboDrawer";
import WalletRedirect from "./WalletRedirect";

export const Wallet = () => {
  const solLink = useFtxPayLink();
  const { adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  return (
    <Fragment>
      <WumboDrawer.Header title="Wallet" />
      <WumboDrawer.Content>
        <Box>
          <WalletRedirect />
          <CommonWallet
            sendLink={routes.sendSearch.path}
            wumLeaderboardLink={publicKey ? wumNetWorthPath(publicKey) : ""}
            solLink={solLink}
            getTokenLink={(t) =>
              t.tokenRef
                ? viewProfilePath(t.tokenRef.mint)
                : t.tokenBonding
                ? swapPath(
                    t.tokenBonding.publicKey,
                    t.tokenBonding.baseMint,
                    t.tokenBonding.targetMint
                  )
                : null
            }
          />
        </Box>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
