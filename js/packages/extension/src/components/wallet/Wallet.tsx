import React, { Fragment, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useWallet, useQuery, WalletSelect, usePrevious } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";

export const Wallet = () => {
  const history = useHistory();
  const query = useQuery();
  const { connected } = useWallet();
  const prevConnected = usePrevious(connected);

  useEffect(() => {
    if (connected && !prevConnected) {
      const redirect = query.get("redirect");
      if (redirect) {
        console.log(`Redirecting to ${redirect}`);
        history.push(redirect);
      }
    }
  }, [connected, prevConnected]);

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
