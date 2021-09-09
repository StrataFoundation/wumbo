import { Spinner, ViewNft as CommonViewNft, useTokenMetadata } from "wumbo-common";
import React, { Fragment, useMemo } from "react";
import { useParams } from "react-router-dom";
import AppContainer from "../../common/AppContainer";
import { profilePath } from "../../../constants/routes";
import { PublicKey } from "@solana/web3.js";

export const ViewNftRoute = () => {
  const params = useParams<{ mint: string | undefined }>();
  const token = useMemo(() => 
    params.mint ? new PublicKey(params.mint) : undefined,
    [params.mint]
  )
  const { loading } = useTokenMetadata(token);

  if (loading) {
    return <AppContainer>
      <Spinner />
    </AppContainer>
  }

  return (
    <AppContainer>
      <CommonViewNft
        token={token}
        getCreatorLink={(c, t, tokenBonding) => {
          return tokenBonding ? profilePath(tokenBonding.publicKey) : `https://explorer.solana.com/address/${c.address.toBase58()}`
        }}
      />
    </AppContainer>
  );
};
