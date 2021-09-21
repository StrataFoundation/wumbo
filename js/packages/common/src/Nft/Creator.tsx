import React from "react";
import { Metadata as MetaplexMetadata } from "@oyster/common";
import { ITokenBonding, ITokenRef, useSocialTokenMetadata } from "../utils";
import { Link } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { Avatar } from "../";
import { handleErrors } from "../contexts";

export type GetCreatorLink = (
  c: PublicKey,
  t: MetaplexMetadata | undefined,
  b: ITokenRef | undefined
) => string;

export const Creator = React.memo(
  ({
    creator,
    getCreatorLink,
  }: {
    creator: PublicKey;
    getCreatorLink: GetCreatorLink;
  }) => {
    const { metadata, tokenRef, error, image } = useSocialTokenMetadata(creator);
    handleErrors(error);

    const truncatePubkey = (pkey: PublicKey): string => {
      const pkeyStr = pkey.toString();

      return `${pkeyStr.substr(0, 4)}...${pkeyStr.substr(pkeyStr.length - 4)}`;
    };

    return (
      <Link to={getCreatorLink(creator, metadata, tokenRef)}>
        {metadata && (
          <Avatar
            showDetails
            size="xs"
            src={image}
            name={metadata.data.name}
          />
        )}
        {!metadata && truncatePubkey(creator)}
      </Link>
    );
  }
);
