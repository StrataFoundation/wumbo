import React, { useMemo } from "react";
import {
  Spinner,
  ViewNft as CommonViewNft,
  useTokenLargestAccounts,
} from "wumbo-common";
import { useTokenMetadata, useTokenAccount } from "@strata-foundation/react";
import { useParams } from "react-router-dom";
import { profilePath } from "../../../../../constants/routes";
import { PublicKey } from "@solana/web3.js";
import { AppContainer } from "../../common/AppContainer";

export const ViewNftRoute: React.FC = () => {
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
  const { loading: loading3, info } = useTokenAccount(res2?.value[0]?.address);
  const loading = loading1 || loading2 || loading3;

  if (loading) {
    return (
      <AppContainer>
        <Spinner />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <CommonViewNft
        token={token}
        owner={info?.owner}
        getCreatorLink={(c, t, tokenRef) => {
          return tokenRef
            ? profilePath(tokenRef.mint)
            : `https://explorer.solana.com/address/${c.toBase58()}`;
        }}
      />
    </AppContainer>
  );
};
