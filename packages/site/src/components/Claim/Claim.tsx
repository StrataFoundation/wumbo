import React from "react";
import AppContainer from "../common/AppContainer";
import routes from "../../constants/routes";
import { Alert, AlertIcon } from "@chakra-ui/react";
import { Claim, useQuery, } from "wumbo-common";
import { useHistory } from "react-router-dom";
import WalletRedirect from "../Wallet/WalletRedirect";

export const ClaimRoute = React.memo(() => {
  const query = useQuery();
  const code = query.get("code");
  const name = query.get("name");
  const redirectUri = `${window.location.origin.replace(/\/$/, "")}${
    routes.claim.path
  }`;
  const history = useHistory();

  if (!code) {
    return (
      <AppContainer>
        <Alert status="error">
          <AlertIcon />
          No authorization code
        </Alert>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <WalletRedirect />
      <Claim
        handle={name || undefined}
        code={code}
        redirectUri={redirectUri}
        onComplete={({ owner }) => {
          history.push(
            routes.editProfile.path.replace(":ownerWalletKey", owner.toBase58())
          );
        }}
      />
    </AppContainer>
  );
});
