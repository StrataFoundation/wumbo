import React, { Fragment } from "react";
import { WumboDrawer } from "../WumboDrawer";
import { useUserTokensWithMeta, useWallet } from "wumbo-common"

export const MyCoins = () => {
  const wallet = useWallet();
  const coinies = useUserTokensWithMeta(wallet.publicKey);
  console.log(coinies);
  return (
    <Fragment>
      <WumboDrawer.Header title="My Coins" />
      <WumboDrawer.Content>Add the My Coins UI here</WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  )
};
