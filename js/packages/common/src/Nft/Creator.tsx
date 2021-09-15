import React from "react";
import { Metadata as MetaplexMetadata } from "@oyster/common";
import { ITokenRef, useSocialTokenMetadata } from "../utils";
import { Link } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import { ITokenBonding } from "../utils/deserializers/spl-token-bonding";

export type GetCreatorLink = (
  c: PublicKey,
  t: MetaplexMetadata | undefined,
  b: ITokenRef | undefined
) => string;

export const Creator = React.memo(
  ({ creator, getCreatorLink }: { creator: PublicKey; getCreatorLink: GetCreatorLink }) => {
    const { metadata, tokenRef } = useSocialTokenMetadata(creator);

    return (
      <Link to={getCreatorLink(creator, metadata, tokenRef)}>
        {metadata?.data.name || creator.toBase58()}
      </Link>
    );
  }
);
