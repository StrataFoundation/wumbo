import React from 'react';
import { Creator as MetaplexCreator, Metadata as MetaplexMetadata } from '@oyster/common';
import { Badge } from "../Badge";
import { useReverseTwitter, useSocialTokenMetadata } from '../utils';
import { Link } from 'react-router-dom';
import { TokenBondingV0 } from '../../../spl-token-bonding/dist/lib';
import { PublicKey } from '@solana/web3.js';

export type GetCreatorLink = (c: PublicKey, t: MetaplexMetadata | undefined, b: TokenBondingV0 | undefined) => string;

export const Creator = React.memo(({ creator, getCreatorLink }: { creator: PublicKey, getCreatorLink: GetCreatorLink }) => {
  const { metadata, tokenBonding } = useSocialTokenMetadata(creator);

  return <Link
    className="truncate max-w-18 text-blue-500"
    to={getCreatorLink(creator, metadata, tokenBonding)}
  >
    {metadata?.data.name || creator.toBase58()}
  </Link>
});
