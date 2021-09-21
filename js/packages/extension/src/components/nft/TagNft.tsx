import {
  TagNft as CommonTagNft,
  useTokenMetadata,
  useTokenLargestAccounts,
  useAccount,
  handleErrors
} from "wumbo-common";
import React, { Fragment, useMemo } from "react";
import { WumboDrawer } from "../WumboDrawer";
import { useParams } from "react-router-dom";
import { viewProfilePath } from "@/constants/routes";
import { PublicKey } from "@solana/web3.js";
import { TokenAccountParser } from "@oyster/common";
import WalletRedirect from "../wallet/WalletRedirect";

export const TagNft: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const token = useMemo(
    () => (params.mint ? new PublicKey(params.mint) : undefined),
    [params.mint]
  );

  const { loading: loading1 } = useTokenMetadata(token);
  const { loading: loading2, result: res2, error: err2 } = useTokenLargestAccounts(token);
  const { loading: loading3, info } = useAccount(res2?.value[0]?.address, TokenAccountParser);
  const loading = loading1 || loading2 || loading3;

  handleErrors(err2)

  if (loading) {
    return <WumboDrawer.Loading />;
  }


  return (
    <Fragment>
      <WumboDrawer.Header />
      <WumboDrawer.Content>
        <WalletRedirect />
        <CommonTagNft
          token={token}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
