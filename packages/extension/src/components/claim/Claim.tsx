import { routes } from "@/constants/routes";
import React, { Fragment } from "react";
import { useHistory } from "react-router-dom";
import { Alert, AlertIcon } from "@chakra-ui/react";
import { Claim, useQuery } from "wumbo-common";
import WalletRedirect from "../wallet/WalletRedirect";
import { WumboDrawer } from "../WumboDrawer";

export default React.memo(() => {
  const query = useQuery();
  const code = query.get("code");
  const name = query.get("name");
  const redirectUri = query.get("redirectUri");
  const history = useHistory();

  if (!code || !redirectUri || !name) {
    return (
      <Fragment>
        <WalletRedirect />
        <WumboDrawer.Header title="Claim" />
        <WumboDrawer.Content>
          {!code && (
            <Alert status="error">
              <AlertIcon />
              Redirect missing code
            </Alert>
          )}
          {!redirectUri && (
            <Alert status="error">
              <AlertIcon />
              Redirect missing redirectUri
            </Alert>
          )}
          {!name && (
            <Alert status="error">
              <AlertIcon />
              Redirect missing name
            </Alert>
          )}
        </WumboDrawer.Content>
        <WumboDrawer.Nav />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <WalletRedirect />
      <WumboDrawer.Header title="Claim" />
      <WumboDrawer.Content>
        <Claim
          handle={name}
          redirectUri={redirectUri}
          code={code}
          onComplete={() => history.replace(routes.editProfile.path)}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
});
