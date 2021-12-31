import {
  ViewNft as CommonViewNft,
  useTokenLargestAccounts,
} from "wumbo-common";
import {
  useErrorHandler,
  useTokenMetadata,
  useTokenAccount,
} from "@strata-foundation/react";
import React, { Fragment, useMemo } from "react";
import { useOutsideOfDrawerRef, WumboDrawer } from "../WumboDrawer";
import { useParams } from "react-router-dom";
import { viewProfilePath, tagNftPath } from "@/constants/routes";
import { PublicKey } from "@solana/web3.js";

export const ViewNft: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const token = useMemo(
    () => (params.mint ? new PublicKey(params.mint) : undefined),
    [params.mint]
  );

  const { handleErrors } = useErrorHandler();
  const modalRef = useOutsideOfDrawerRef();

  const { loading: loading1, metadata } = useTokenMetadata(token);
  const {
    loading: loading2,
    result: res2,
    error: err2,
  } = useTokenLargestAccounts(token);
  const { loading: loading3, info } = useTokenAccount(res2?.value[0]?.address);
  const loading = loading1 || loading2 || loading3;
  handleErrors(err2);

  if (loading) {
    return <WumboDrawer.Loading />;
  }

  return (
    <Fragment>
      <WumboDrawer.Header title={metadata?.data.name || "View NFT"} />
      <WumboDrawer.Content>
        <CommonViewNft
          modalRef={modalRef}
          tagNftPath={token ? tagNftPath(token) : undefined}
          token={token}
          j
          owner={info?.owner}
          getCreatorLink={(c, t, tokenRef, handle) => {
            return tokenRef
              ? viewProfilePath(tokenRef.mint)
              : handle ? `https://twitter.com/${handle}`
              : `https://explorer.solana.com/address/${c.toBase58()}`;
          }}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
