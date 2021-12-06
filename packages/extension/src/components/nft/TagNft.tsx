import { TagNft as CommonTagNft, useTokenLargestAccounts } from "wumbo-common";
import {
  useTokenMetadata,
  useTokenAccount,
  useErrorHandler,
} from "@strata-foundation/react";
import React, { Fragment, useMemo } from "react";
import { WumboDrawer } from "../WumboDrawer";
import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import WalletRedirect from "../wallet/WalletRedirect";

export const TagNft: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const token = useMemo(
    () => (params.mint ? new PublicKey(params.mint) : undefined),
    [params.mint]
  );
  const { handleErrors } = useErrorHandler();
  const { loading: loading1, metadata, error: err1 } = useTokenMetadata(token);
  const {
    loading: loading2,
    result: res2,
    error: err2,
  } = useTokenLargestAccounts(token);
  const { loading: loading3, info } = useTokenAccount(res2?.value[0]?.address);
  const loading = loading1 || loading2 || loading3;

  handleErrors(err1, err2);

  if (loading) {
    return <WumboDrawer.Loading />;
  }

  return (
    <Fragment>
      <WumboDrawer.Header title={`Tag ${metadata?.data.name}`} />
      <WumboDrawer.Content>
        <WalletRedirect />
        <CommonTagNft token={token} />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
