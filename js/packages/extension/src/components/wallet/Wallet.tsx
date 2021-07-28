import React, { Fragment, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useWallet, WalletSelect } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";
import { usePrevious, useQuery } from "wumbo-common";

export const Wallet = () => {
  const history = useHistory();
  const query = useQuery();
  const { wallet } = useWallet();
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
        console.log(`Redirecting to ${redirect}`);
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
