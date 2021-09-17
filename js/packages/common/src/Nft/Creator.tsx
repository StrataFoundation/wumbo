import React from "react";
import { Metadata as MetaplexMetadata } from "@oyster/common";
import { useSocialTokenMetadata, ITokenBonding } from "../utils";
import { Link } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { Avatar } from "../";

export type GetCreatorLink = (
  c: PublicKey,
  t: MetaplexMetadata | undefined,
  b: ITokenBonding | undefined
) => string;

export const Creator = React.memo(
  ({
    creator,
    getCreatorLink,
  }: {
    creator: PublicKey;
    getCreatorLink: GetCreatorLink;
  }) => {
    const { metadata, tokenBonding } = useSocialTokenMetadata(creator);
    const truncatePubkey = (pkey: PublicKey): string => {
      const pkeyStr = pkey.toString();

      return `${pkeyStr.substr(0, 4)}...${pkeyStr.substr(pkeyStr.length - 4)}`;
    };

    return (
      <Link to={getCreatorLink(creator, metadata, tokenBonding)}>
        {metadata && (
          <Avatar
            showDetails
            size="xs"
            imgSrc={metadata.data.uri}
            name={metadata.data.name}
          />
        )}
        {!metadata && truncatePubkey(creator)}
      </Link>
    );
  }
);
