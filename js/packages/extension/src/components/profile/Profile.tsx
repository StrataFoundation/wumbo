import { useWallet, useClaimedTokenRef, Profile as CommonProfile } from "wumbo-common";
import React, { Fragment } from "react";
import { WumboDrawer } from "../WumboDrawer";
import { useHistory, useParams } from 'react-router-dom';
import { tradePath, viewProfilePath } from "@/constants/routes";
import WalletRedirect from "../wallet/WalletRedirect";
import { PublicKey } from "@solana/web3.js";

export const Profile = () => {
  const params = useParams<{ tokenBondingKey: string | undefined }>();
  const { wallet, connected } = useWallet();
  const { info: tokenRef, loading } = useClaimedTokenRef(wallet?.publicKey || undefined);
  const history = useHistory();

  let tokenBondingKey: PublicKey;
  if (params.tokenBondingKey) {
    tokenBondingKey = new PublicKey(params.tokenBondingKey);
  } else {
    if (!connected) {
      return <WalletRedirect />
    }

    if (loading) {
      return <WumboDrawer.Loading />
    }

    if (!tokenRef) {
      return <Fragment>
        <WalletRedirect />
        <WumboDrawer.Header title="Profile" />
        <WumboDrawer.Content>
          It looks like you haven't claimed a coin yet
        </WumboDrawer.Content>
        <WumboDrawer.Nav />
      </Fragment>
    };

    tokenBondingKey = tokenRef.tokenBonding
  }

  return (
    <Fragment>
      <WumboDrawer.Header title="Profile" />
      <WumboDrawer.Content>
        <CommonProfile 
          tokenBondingKey={tokenBondingKey}
          onAccountClick={(tokenBonding) => history.push(viewProfilePath(tokenBonding))}
          onTradeClick={() => history.push(tradePath(tokenBondingKey))}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  )
};
