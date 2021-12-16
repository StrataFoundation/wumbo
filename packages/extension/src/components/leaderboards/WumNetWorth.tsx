import { WumNetWorthLeaderboard } from "wumbo-common";
import { PublicKey } from "@solana/web3.js";
import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { WumboDrawer } from "../WumboDrawer";
import { viewProfilePath } from "@/constants/routes";

export const WumNetWorth = () => {
  const params = useParams<{ wallet: string | undefined }>();
  const passedWallet = params.wallet ? new PublicKey(params.wallet) : undefined;
  const history = useHistory();

  return (
    <Fragment>
      <WumboDrawer.Header title={"Top Net Worth"} />
      <WumboDrawer.Content>
        <WumNetWorthLeaderboard
          wallet={passedWallet}
          onAccountClick={(mintKey) =>
            history.push(viewProfilePath(mintKey))
          }
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
