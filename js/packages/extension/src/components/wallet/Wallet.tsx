import { Box } from "@chakra-ui/react";
import React, { Fragment, useEffect } from "react";
import { viewProfilePath, tradePath, wumNetWorthPath, routes } from "@/constants/routes";
import { useHistory } from "react-router-dom";
import { useFtxPayLink, useWallet, Wallet as CommonWallet, WUM_BONDING } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";

export const Wallet = () => {
  const solLink = useFtxPayLink();
  const { publicKey } = useWallet();

  return (
    <Fragment>
      <WumboDrawer.Header title="Wallet" />
      <WumboDrawer.Content>
        <Box padding={4}>
          <CommonWallet
            sendLink={routes.sendSearch.path}
            wumLeaderboardLink={publicKey ? wumNetWorthPath(publicKey) : ""}
            solLink={solLink}        
            wumLink={tradePath(WUM_BONDING)}
            getTokenLink={(t) => t.tokenRef ? viewProfilePath(t.tokenRef.publicKey) : ""}
          />
        </Box>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
