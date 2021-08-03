import React, { useState } from "react";
import AppContainer from "../common/AppContainer";
import routes from "../../constants/routes";
import {
  Alert,
  Claim,
  useQuery
} from "wumbo-common";
import { useHistory } from "react-router-dom";
import WalletRedirect from "../Wallet/WalletRedirect";

export const ClaimRoute = React.memo(() => {
  const query = useQuery();
  const code = query.get("code");
  const name = query.get("name")
  const redirectUri = `${window.location.origin.replace(/\/$/, "")}${routes.claim.path}`;
  const history = useHistory();
  
  if (!code) {
    return  <AppContainer>
      <Alert message="No authorization code" type="error" />
    </AppContainer>
  }

  return (
    <AppContainer>
      <WalletRedirect />
      <Claim
        handle={name || undefined}
        code={code}
        redirectUri={redirectUri}
        onComplete={({ ownerKey }) => {
          history.push(
            routes.editProfile.path.replace(
              ":ownerWalletKey",
              ownerKey.toBase58()
            )
          );
        }}
      />
    </AppContainer>
  )
});
