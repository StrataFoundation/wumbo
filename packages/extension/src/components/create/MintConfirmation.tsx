import { usePublicKey } from "@strata-foundation/react";
import React, { Fragment } from "react";
import { MintConfirmation, useQuery } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";

export const MintConfirmationRoute = () => {
  const query = useQuery();
  const handle = query.get("handle");
  const buyLink = query.get("buyLink");

  return (
    <Fragment>
      <WumboDrawer.Header title="Confirmation" />
      <WumboDrawer.Content>
        <MintConfirmation handle={handle!} buyLink={buyLink!} />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
