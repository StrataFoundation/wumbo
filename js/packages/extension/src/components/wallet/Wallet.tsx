import React, { Fragment, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { WalletProvider } from "@solana/wallet-base";
import { useWallet, WalletSelect } from "wumbo-common";
import { Button, Alert } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";
import { routes } from "@/constants/routes";
import { usePrevious, useQuery } from "@/utils/utils";

export const Wallet = () => {
  const history = useHistory();
  const query = useQuery();
  const { connect, disconnect, wallet, setProviderUrl, setAutoConnect, error } =
    useWallet();
  const prevWallet = usePrevious(wallet);

  useEffect(() => {
    /*
     ** if we're connecting a wallet for the first time and
     ** have navigated away from the create or trade screen
     ** then nevigate back after connecting
     */
    if (wallet && wallet.publicKey && prevWallet && !prevWallet.publicKey) {
      const redirect = query.get("redirect");
      if (redirect) {
        history.push(redirect);
      }
    }
  }, [wallet, query.get("redirect"), prevWallet, history]);

  return (
    <Fragment>
      <WumboDrawer.Header title="Wallet" />
      <WumboDrawer.Content>
        <WalletSelect />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
