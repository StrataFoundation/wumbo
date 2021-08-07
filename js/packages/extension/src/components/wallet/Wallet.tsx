import React, { Fragment, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useWallet, useQuery, WalletSelect, usePrevious } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";

export const Wallet = () => {
  const history = useHistory();
  const query = useQuery();
  const { connected, publicKey } = useWallet();
  const prevConnected = usePrevious(connected);

  useEffect(() => {
    if (connected && publicKey && !prevConnected) {
      const redirect = query.get("redirect");
      if (redirect) {
        console.log(`Redirecting to ${redirect}`);
        history.push(redirect);
      }
    }
  }, [connected, publicKey, prevConnected]);

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
