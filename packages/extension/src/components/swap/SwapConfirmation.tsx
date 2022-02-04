import { usePublicKey } from "@strata-foundation/react";
import React, { Fragment } from "react";
import { SwapConfirmation, useQuery } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";

export const SwapConfirmationRoute = () => {
  const query = useQuery();
  const amount = query.get("amount");
  const mint = usePublicKey(query.get("mint"));
  return (
    <Fragment>
      <WumboDrawer.Header title="Confirmation" />
      <WumboDrawer.Content>
        <SwapConfirmation mint={mint} amount={Number(amount)} />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
