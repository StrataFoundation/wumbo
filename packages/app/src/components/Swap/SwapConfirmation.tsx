import { usePublicKey } from "@strata-foundation/react";
import React from "react";
import { SwapConfirmation, useQuery } from "wumbo-common";
import { AppContainer } from "../AppContainer";

export const SwapConfirmationRoute: React.FC = () => {
  const query = useQuery();
  const amount = query.get("amount");
  const mint = usePublicKey(query.get("mint"));

  return (
    <AppContainer>
      <SwapConfirmation mint={mint} amount={Number(amount)} />
    </AppContainer>
  );
};
