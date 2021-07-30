import { useWallet, useClaimedTokenRef, Profile as CommonProfile } from "wumbo-common";
import React, { Fragment } from "react";
import { WumboDrawer } from "../WumboDrawer";
import { useHistory } from 'react-router-dom';
import { routes } from "@/constants/routes";

export const Profile = () => {
  const { wallet } = useWallet()
  const history = useHistory();
  const { info: tokenRef, loading } = useClaimedTokenRef(wallet?.publicKey);

  return (
    <Fragment>
      <WumboDrawer.Header title="Profile" />
      <WumboDrawer.Content>
        <CommonProfile 
          ownerWalletKey={wallet?.publicKey} 
          onAccountClick={(account) => history.push(routes.profile.path.replace(":ownerWalletKey", account.owner.toBase58()))}
          onTradeClick={() => history.push(routes.trade.path.replace(":tokenBondingKey", tokenRef.tokenBonding))}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  )
};
