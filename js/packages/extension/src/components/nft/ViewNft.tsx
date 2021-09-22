import {
  ViewNft as CommonViewNft,
  useTokenMetadata,
  useTokenLargestAccounts,
  useAccount,
  handleErrors
} from "wumbo-common";
import React, { Fragment, useMemo } from "react";
import { WumboDrawer } from "../WumboDrawer";
import { useParams } from "react-router-dom";
import { viewProfilePath, tagNftPath } from "@/constants/routes";
import { PublicKey } from "@solana/web3.js";
import { TokenAccountParser } from "@oyster/common";

export const ViewNft: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const token = useMemo(
    () => (params.mint ? new PublicKey(params.mint) : undefined),
    [params.mint]
  );

  const { loading: loading1, metadata } = useTokenMetadata(token);
  const { loading: loading2, result: res2, error: err2 } = useTokenLargestAccounts(token);
  const { loading: loading3, info } = useAccount(res2?.value[0]?.address, TokenAccountParser);
  const loading = loading1 || loading2 || loading3;
  handleErrors(err2)

  if (loading) {
    return <WumboDrawer.Loading />;
  }

  return (
    <Fragment>
      <WumboDrawer.Header title={metadata?.data.name || "View NFT"} />
      <WumboDrawer.Content>
        <CommonViewNft
          tagNftPath={token ? tagNftPath(token) : undefined}
          token={token}
          owner={info?.info?.owner}
          getCreatorLink={(c, t, tokenRef) => {
            return tokenRef
              ? viewProfilePath(tokenRef.publicKey)
              : `https://explorer.solana.com/address/${c.toBase58()}`;
          }}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
