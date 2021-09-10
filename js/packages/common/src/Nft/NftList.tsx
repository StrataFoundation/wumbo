import { PublicKey } from "@solana/web3.js";
import { NftCard } from "./NftCard";
import React from "react";
import { Spinner } from "../Spinner";
import { ITokenWithMeta, ITokenWithMetaAndAccount, useUserTokensWithMeta } from "../utils";

export const NftListRaw = React.memo(
  ({
    tokens,
    getLink,
    loading = !!tokens
  }: {
    tokens?: ITokenWithMetaAndAccount[],
    getLink: (t: ITokenWithMeta) => string;
    loading?: boolean;
  }) => {
    if (!tokens || loading) {
      return <Spinner />;
    }

    return (
      <div className="flex flex-row flex-wrap gap-4">
        {tokens
          .filter((t) => t.masterEdition)
          .map((token) => (
            <NftCard
              key={token.publicKey?.toBase58()}
              getLink={getLink}
              token={token}
            />
          ))}
      </div>
    );
  }
);

export const NftList = React.memo(
  ({
    owner,
    getLink
  }: {
    owner?: PublicKey;
    getLink: (t: ITokenWithMeta) => string;
  }) => {
    const { result: tokens, loading, error } = useUserTokensWithMeta(owner);
    return <NftListRaw getLink={getLink} loading={loading} tokens={tokens} />
  }
);
