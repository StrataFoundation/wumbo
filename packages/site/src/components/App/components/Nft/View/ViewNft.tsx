import React, { useMemo } from "react";
import {
  Spinner,
  ViewNft as CommonViewNft,
  useTokenMetadata,
  useTokenLargestAccounts,
  useAccount,
} from "wumbo-common";
import { useParams } from "react-router-dom";
import { profilePath } from "../../../../../constants/routes";
import { PublicKey } from "@solana/web3.js";
import { TokenAccountParser } from "@oyster/common";

export const ViewNftRoute = () => {
  const params = useParams<{ mint: string | undefined }>();
  const token = useMemo(
    () => (params.mint ? new PublicKey(params.mint) : undefined),
    [params.mint]
  );

  const { loading: loading1 } = useTokenMetadata(token);
  const {
    loading: loading2,
    result: res2,
    error: err2,
  } = useTokenLargestAccounts(token);
  const { loading: loading3, info } = useAccount(
    res2?.value[0]?.address,
    TokenAccountParser
  );
  const loading = loading1 || loading2 || loading3;

  if (loading) {
    return <Spinner />;
  }

  return (
    <CommonViewNft
      token={token}
      owner={info?.info.owner}
      getCreatorLink={(c, t, tokenRef) => {
        return tokenRef
          ? profilePath(tokenRef.publicKey)
          : `https://explorer.solana.com/address/${c.toBase58()}`;
      }}
    />
  );
};
