import React, { Fragment, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useHistory, useParams } from "react-router-dom";
import {
  EditProfile, useClaimedTokenRef, useWallet
} from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";
import WalletRedirect from "../wallet/WalletRedirect";
import { routes } from "@/constants/routes";

export const EditProfileRoute = React.memo(() => {
  const { wallet, connected } = useWallet();
  const history = useHistory();

  if (!connected) {
    return <WalletRedirect />
  }

  return (
    <Fragment>
      <WalletRedirect />
      <WumboDrawer.Header title="Edit Profile" />
      <WumboDrawer.Content>
        <EditProfile ownerWalletKey={wallet!.publicKey!} onComplete={() => history.push(routes.profile.path)} />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  )
});
