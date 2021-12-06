import React, { useEffect } from "react";
import routes, { profilePath, wumNetWorthPath } from "../../constants/routes";
import AppContainer from "../common/AppContainer";
import { Wallet } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";
import { Box } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFtxPayLink } from "@strata-foundation/react";

export default React.memo(() => {
  const solLink = useFtxPayLink();
  const { adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  return (
    <AppContainer>
      <WalletRedirect />
      <Box p={4}>
        <Wallet
          wumLeaderboardLink={publicKey ? wumNetWorthPath(publicKey) : ""}
          getTokenLink={(t) =>
            t.tokenRef?.publicKey ? profilePath(t.tokenRef?.publicKey) : ""
          }
          wumLink={""}
          solLink={solLink}
          sendLink={routes.sendSearch.path}
        />
      </Box>
    </AppContainer>
  );
});
