import { ViewNft as CommonViewNft, useTokenMetadata } from "wumbo-common";
import React, { Fragment, useMemo } from "react";
import { WumboDrawer } from "../WumboDrawer";
import { useParams } from "react-router-dom";
import { viewProfilePath } from "@/constants/routes";
import { PublicKey } from "@solana/web3.js";

export const ViewNft = () => {
  const params = useParams<{ mint: string | undefined }>();
  const token = useMemo(
    () => (params.mint ? new PublicKey(params.mint) : undefined),
    [params.mint]
  );
  const { loading } = useTokenMetadata(token);

  if (loading) {
    return <WumboDrawer.Loading />;
  }

  return (
    <Fragment>
      <WumboDrawer.Header />
      <WumboDrawer.Content>
        <CommonViewNft
          token={token}
          getCreatorLink={(c, t, tokenBonding) => {
            return tokenBonding
              ? viewProfilePath(tokenBonding.publicKey)
              : `https://explorer.solana.com/address/${c.toBase58()}`;
          }}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
