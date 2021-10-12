import { TopTokenLeaderboard } from "wumbo-common";
import { PublicKey } from "@solana/web3.js";
import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { profilePath } from "../../constants/routes";
import AppContainer from "../common/AppContainer";

export const TopTokens = () => {
  const params = useParams<{ tokenBondingKey: string | undefined }>();
  const passedTokenBondingKey = params.tokenBondingKey
  ? new PublicKey(params.tokenBondingKey)
    : undefined;
  const history = useHistory();

  return <AppContainer>
    <TopTokenLeaderboard
      tokenBondingKey={passedTokenBondingKey}
      onAccountClick={(tokenRefKey) =>
        history.push(profilePath(tokenRefKey))
      }
    />
  </AppContainer>
}
