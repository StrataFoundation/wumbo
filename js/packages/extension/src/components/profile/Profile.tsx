import { useAccount, TokenRef, useWallet, Profile as CommonProfile, Badge, useClaimedTokenRefKey } from "wumbo-common";
import React, { Fragment, useMemo } from "react";
import { WumboDrawer } from "../WumboDrawer";
import { Link, useHistory, useParams } from "react-router-dom";
import { nftPath, routes, tradePath, viewProfilePath } from "@/constants/routes";
import WalletRedirect from "../wallet/WalletRedirect";
import { PublicKey } from "@solana/web3.js";
import { PencilAltIcon } from "@heroicons/react/solid";
import { useClaimFlow } from "@/utils/claim";

export const Profile = () => {
  const params = useParams<{ tokenRefKey: string | undefined }>();
  const { connected, publicKey } = useWallet();
  const walletTokenRefKey = useClaimedTokenRefKey(publicKey || undefined);
  const passedTokenRefKey = params.tokenRefKey ? new PublicKey(params.tokenRefKey) : undefined;
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
        <WumboDrawer.Content>It looks like you haven't claimed a coin yet</WumboDrawer.Content>
        <WumboDrawer.Nav />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <WumboDrawer.Header>
        <div className="flex justify-between w-full">
          <p className="text-lg font-medium text-indigo-600">Profile</p>
          <Link to={routes.editProfile.path}>
            <Badge rounded hoverable color="neutral">
              <PencilAltIcon width="20" height="20" className="mr-2" /> Edit
            </Badge>
          </Link>
        </div>
      </WumboDrawer.Header>
      <WumboDrawer.Content>
        <CommonProfile
          editPath={routes.editProfile.path}
          useClaimFlow={useClaimFlow}
          tokenRefKey={tokenRefKey}
          onAccountClick={(tokenRefKey) => history.push(viewProfilePath(tokenRefKey))}
          onTradeClick={() => tokenRef && history.push(tradePath(tokenRef.tokenBonding))}
          getNftLink={(token) => token?.metadata ? nftPath(token?.metadata?.mint) : ""}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
