import React from "react";
import { TopTokenLeaderboard } from "wumbo-common";
import { PublicKey } from "@solana/web3.js";
import { useHistory, useParams } from "react-router-dom";
import { profilePath } from "../../../../constants/routes";

export const TopTokens = () => {
  const params = useParams<{ tokenBondingKey: string | undefined }>();
  const passedTokenBondingKey = params.tokenBondingKey
    ? new PublicKey(params.tokenBondingKey)
    : undefined;
  const history = useHistory();

  return (
    <TopTokenLeaderboard
      tokenBondingKey={passedTokenBondingKey}
      onAccountClick={(mintKey) => history.push(profilePath(mintKey))}
    />
  );
};
