import React, { Fragment } from "react";
import { useHistory } from "react-router-dom";
import { EditProfile, useWallet } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";
import WalletRedirect from "../wallet/WalletRedirect";
import { routes } from "@/constants/routes";

export const EditProfileRoute = React.memo(() => {
  const { connected, publicKey } = useWallet();
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
