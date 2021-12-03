import { Box } from "@chakra-ui/react";
import React, { Fragment } from "react";
import {
  viewProfilePath,
  tradePath,
  wumNetWorthPath,
  routes,
} from "@/constants/routes";
import {
  useFtxPayLink,
  useWallet,
  Wallet as CommonWallet,
  OPEN_BONDING,
} from "wumbo-common";
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
            wumLink={tradePath(OPEN_BONDING, "buy")}
            getTokenLink={(t) =>
              t.tokenRef ? viewProfilePath(t.tokenRef.publicKey) : ""
            }
          />
        </Box>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
