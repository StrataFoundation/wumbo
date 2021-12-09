import React, { Fragment } from "react";
import { useHistory } from "react-router-dom";
import { EditProfile } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";
import WalletRedirect from "../wallet/WalletRedirect";
import { routes } from "@/constants/routes";
import { useWallet } from "@solana/wallet-adapter-react";

export const EditProfileRoute = React.memo(() => {
  const { connected, adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  const history = useHistory();

  if (!connected) {
    return <WalletRedirect />;
  }

  return (
    <Fragment>
      <WalletRedirect />
      <WumboDrawer.Header title="Edit Profile" />
      <WumboDrawer.Content>
        <EditProfile
          ownerWalletKey={publicKey!}
          onComplete={() => history.push(routes.profile.path)}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
});
