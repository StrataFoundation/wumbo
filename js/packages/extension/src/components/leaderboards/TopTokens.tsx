import { TopTokenLeaderboard } from "wumbo-common";
import { PublicKey } from "@solana/web3.js";
import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { WumboDrawer } from "../WumboDrawer";
import { viewProfilePath } from "@/constants/routes";

export const TopTokens = () => {
  const params = useParams<{ tokenBondingKey: string | undefined }>();
  const passedTokenBondingKey = params.tokenBondingKey
  ? new PublicKey(params.tokenBondingKey)
  : undefined;
  const history = useHistory();

  return <Fragment>
    <WumboDrawer.Header title={"Top Tokens"} />
    <WumboDrawer.Content>
      <TopTokenLeaderboard 
        tokenBondingKey={passedTokenBondingKey} 
        onAccountClick={(tokenRefKey) =>
          history.push(viewProfilePath(tokenRefKey))
        }
      />
    </WumboDrawer.Content>
    <WumboDrawer.Nav />
  </Fragment>
}
