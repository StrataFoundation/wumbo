import React, { useEffect } from "react";
import { profilePath, wumNetWorthPath } from "../../constants/routes";
import AppContainer from "../common/AppContainer";
import { useHistory } from "react-router-dom";
import { useFtxPayLink, useWallet, Wallet } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";
import { Box } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";

export default React.memo(() => {
  const solLink = useFtxPayLink();
  const { publicKey } = useWallet();
  
  return (
    <AppContainer>
      <WalletRedirect />
      <Box p={4}>
        <Wallet
          wumLeaderboardLink={publicKey ? wumNetWorthPath(publicKey) : ""}
          getTokenLink={(t) => t.tokenRef?.publicKey ? profilePath(t.tokenRef?.publicKey) : ""}
          wumLink={""}
          solLink={solLink}
        />
      </Box>
    </AppContainer>
  );
});
