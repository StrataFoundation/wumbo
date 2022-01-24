import React, { Fragment } from "react";
import { Relink } from "wumbo-common";
import WalletRedirect from "../wallet/WalletRedirect";
import { WumboDrawer } from "../WumboDrawer";

export const RelinkRoute = React.memo(() => {
  return (
    <Fragment>
      <WumboDrawer.Header title="Relink" />
      <WumboDrawer.Content>
        <Relink />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
});
