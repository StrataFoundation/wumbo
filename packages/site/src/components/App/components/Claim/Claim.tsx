import React from "react";
import { AppRoutes } from "../../../../constants/routes";
import { Alert, AlertIcon } from "@chakra-ui/react";
import { Claim, useQuery } from "wumbo-common";
import { useHistory } from "react-router-dom";
import WalletRedirect from "../Wallet/WalletRedirect";

export const ClaimRoute = React.memo(() => {
  const query = useQuery();
  const code = query.get("code");
  const name = query.get("name");
  const redirectUri = `${window.location.origin.replace(/\/$/, "")}${
    AppRoutes.claim.path
  }`;
  const history = useHistory();

  if (!code) {
    return (
      <Alert status="error">
        <AlertIcon />
        No authorization code
      </Alert>
    );
  }

  return (
    <>
      <WalletRedirect />
      <Claim
        handle={name || undefined}
        code={code}
        redirectUri={redirectUri}
        onComplete={({ owner }) => {
          history.push(
            AppRoutes.editProfile.path.replace(
              ":ownerWalletKey",
              owner.toBase58()
            )
          );
        }}
      />
    </>
  );
});
