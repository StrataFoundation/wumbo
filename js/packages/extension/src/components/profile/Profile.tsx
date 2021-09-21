import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import {
  useAccount,
  TokenRef,
  useWallet,
  Profile as CommonProfile,
  useClaimedTokenRefKey,
} from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";
import {
  nftPath,
  routes,
  tradePath,
  viewProfilePath,
} from "@/constants/routes";
import WalletRedirect from "../wallet/WalletRedirect";
import { useClaimFlow } from "@/utils/claim";

export const Profile = () => {
  const params = useParams<{ tokenRefKey: string | undefined }>();
  const { connected, publicKey } = useWallet();
  const walletTokenRefKey = useClaimedTokenRefKey(publicKey || undefined);
  const passedTokenRefKey = params.tokenRefKey
    ? new PublicKey(params.tokenRefKey)
    : undefined;
  const tokenRefKey = passedTokenRefKey || walletTokenRefKey;
  const { info: tokenRef, loading } = useAccount(tokenRefKey, TokenRef, true);

  const history = useHistory();

  if (!tokenRefKey || !connected) {
    return <WalletRedirect />;
  }

  if (loading) {
    return <WumboDrawer.Loading />;
  }

  if (!passedTokenRefKey && !tokenRef) {
    return (
      <Fragment>
        <WumboDrawer.Header title="Profile" />
        <WumboDrawer.Content>
          It looks like you haven't claimed a coin yet
        </WumboDrawer.Content>
        <WumboDrawer.Nav />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <WumboDrawer.Header title="Profile" />
      <WumboDrawer.Content>
        <CommonProfile
          editPath={routes.editProfile.path}
          useClaimFlow={useClaimFlow}
          tokenRefKey={tokenRefKey}
          onAccountClick={(tokenRefKey) =>
            history.push(viewProfilePath(tokenRefKey))
          }
          onTradeClick={() =>
            tokenRef && history.push(tradePath(tokenRef.tokenBonding))
          }
          getNftLink={(token) =>
            token?.metadata ? nftPath(token?.metadata?.mint) : ""
          }
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
