import React from "react";
import {
  AppRoutes,
  profilePath,
  wumNetWorthPath,
} from "../../../../constants/routes";
import { useFtxPayLink, useWallet, Wallet } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";
import { Box } from "@chakra-ui/react";

export default React.memo(() => {
  const solLink = useFtxPayLink();
  const { publicKey } = useWallet();

  return (
    <>
      <WalletRedirect />
      <Box p={4}>
        <Wallet
          wumLeaderboardLink={publicKey ? wumNetWorthPath(publicKey) : ""}
          getTokenLink={(t) =>
            t.tokenRef?.publicKey ? profilePath(t.tokenRef?.publicKey) : ""
          }
          wumLink={""}
          solLink={solLink}
          sendLink={AppRoutes.sendSearch.path}
        />
      </Box>
    </>
  );
});
