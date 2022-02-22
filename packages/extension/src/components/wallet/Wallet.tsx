import { Box } from "@chakra-ui/react";
import React, { Fragment } from "react";
import {
  viewProfilePath,
  swapPath,
  wumNetWorthPath,
  routes,
} from "@/constants/routes";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  useFtxPayLink,
  Wallet as CommonWallet,
} from "@strata-foundation/react";
import { WumboDrawer } from "../WumboDrawer";
import WalletRedirect from "./WalletRedirect";
import { useHistory } from "react-router-dom";

export const Wallet = () => {
  const solLink = useFtxPayLink();
  const history = useHistory();
  const { publicKey } = useWallet();

  return (
    <Fragment>
      <WumboDrawer.Header title="Wallet" />
      <WumboDrawer.Content>
        <Box>
          <WalletRedirect />
          <CommonWallet
            onSendClick={() => history.push(routes.sendSearch.path)}
            wumLeaderboardLink={publicKey ? wumNetWorthPath(publicKey) : ""}
            solLink={solLink}
            onSelect={(t) => {
              if (t.account) {
                history.push(viewProfilePath(t.account.mint));
              }
            }}
          />
        </Box>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
