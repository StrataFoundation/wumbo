import React, { Fragment, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useWallet, useQuery, WalletSelect } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";

export const Wallet = () => {
  const history = useHistory();
  const query = useQuery();
  const { wallet } = useWallet();

  useEffect(() => {
    if (wallet) {
      wallet.on("connect", () => {
        const redirect = query.get("redirect");
        if (redirect) {
          console.log(`Redirecting to ${redirect}`);
          history.push(redirect);
        }
      });
    }
  }, [wallet]);

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
