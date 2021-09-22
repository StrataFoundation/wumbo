import { Box } from "@chakra-ui/react";
import React, { Fragment, useEffect } from "react";
import { viewProfilePath, tradePath } from "@/constants/routes";
import { useHistory } from "react-router-dom";
import { useFtxPayLink, Wallet as CommonWallet, WUM_BONDING } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";

export const Wallet = () => {
  const solLink = useFtxPayLink();

  return (
    <Fragment>
      <WumboDrawer.Header title="Wallet" />
      <WumboDrawer.Content>
        <Box padding={4}>
          <CommonWallet 
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
