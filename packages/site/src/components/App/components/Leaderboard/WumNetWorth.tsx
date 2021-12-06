import React from "react";
import { WumNetWorthLeaderboard } from "wumbo-common";
import { PublicKey } from "@solana/web3.js";
import { useHistory, useParams } from "react-router-dom";
import { profilePath } from "../../../../constants/routes";

export const WumNetWorth = () => {
  const params = useParams<{ wallet: string | undefined }>();
  const passedWallet = params.wallet ? new PublicKey(params.wallet) : undefined;
  const history = useHistory();

  return (
    <WumNetWorthLeaderboard
      wallet={passedWallet}
      onAccountClick={(tokenRefKey) => history.push(profilePath(tokenRefKey))}
    />
  );
};
