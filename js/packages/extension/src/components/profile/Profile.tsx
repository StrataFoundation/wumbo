import { useWallet, useClaimedTokenRef, Profile as CommonProfile, Badge } from "wumbo-common";
import React, { Fragment, useMemo } from "react";
import { WumboDrawer } from "../WumboDrawer";
import { Link, useHistory, useParams } from "react-router-dom";
import { routes, tradePath, viewProfilePath } from "@/constants/routes";
import WalletRedirect from "../wallet/WalletRedirect";
import { PublicKey } from "@solana/web3.js";
import { PencilAltIcon } from "@heroicons/react/solid";

export const Profile = () => {
  const params = useParams<{ tokenBondingKey: string | undefined }>();
  const { publicKey } = useWallet();
  const { info: tokenRef, loading } = useClaimedTokenRef(publicKey || undefined);

  const history = useHistory();

  const tokenBondingKey = useMemo(() => {
    if (params.tokenBondingKey) {
      return new PublicKey(params.tokenBondingKey);
    } else if (tokenRef) {
      return tokenRef.tokenBonding;
    }
  }, [params.tokenBondingKey, tokenRef]);

  if (!params.tokenBondingKey) {
    if (!publicKey) {
      return <WalletRedirect />;
    }

    if (loading) {
      return <WumboDrawer.Loading />;
    }
  }

  if (!tokenBondingKey) {
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
        <div className="wum-flex wum-justify-between wum-w-full">
          <p className="wum-text-lg wum-font-medium wum-text-indigo-600">Profile</p>
          <Link to={routes.editProfile.path}>
            <Badge rounded hoverable color="neutral">
              <PencilAltIcon width="20" height="20" className="wum-mr-2" /> Edit
            </Badge>
          </Link>
        </div>
      </WumboDrawer.Header>
      <WumboDrawer.Content>
        <CommonProfile
          tokenBondingKey={tokenBondingKey}
          onAccountClick={(tokenBonding) => history.push(viewProfilePath(tokenBonding))}
          onTradeClick={() => history.push(tradePath(tokenBondingKey))}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
