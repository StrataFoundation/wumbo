import { PublicKey } from "@solana/web3.js";
import { NftCard } from "./NftCard";
import React from "react";
import { Spinner } from "../Spinner";
import { ITokenWithMeta, ITokenWithMetaAndAccount, useUserTokensWithMeta } from "../utils";

export const NftListRaw = React.memo(
  ({
    tokens,
    getLink,
    loading = !!tokens,
  }: {
    tokens?: ITokenWithMetaAndAccount[];
    getLink: (t: ITokenWithMeta) => string;
    loading?: boolean;
  }) => {
    if (!tokens || loading) {
      return <Spinner />;
    }

    return (
      <ul
        role="list"
        className="grid grid-cols-3 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
      >
        {tokens
          .filter((t) => t.masterEdition)
          .map((token) => (
            <li
              key={token.publicKey?.toBase58()}
              className="col-span-1 flex flex-col text-center rounded-lg border-2 border-gray-100"
            >
              <NftCard getLink={getLink} token={token} />
            </li>
          ))}
      </ul>
    );
  }
);

export const NftList = React.memo(
  ({ owner, getLink }: { owner?: PublicKey; getLink: (t: ITokenWithMeta) => string }) => {
    const { result: tokens, loading, error } = useUserTokensWithMeta(owner);
    return <NftListRaw getLink={getLink} loading={loading} tokens={tokens} />;
  }
);
