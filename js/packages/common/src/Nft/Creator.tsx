import React from 'react';
import { Creator as MetaplexCreator, Metadata as MetaplexMetadata } from '@oyster/common';
import { Badge } from "../Badge";
import { useReverseTwitter, useSocialTokenMetadata } from '../utils';
import { Link } from 'react-router-dom';
import { TokenBondingV0 } from '../../../spl-token-bonding/dist/lib';

export type GetCreatorLink = (c: MetaplexCreator, t: MetaplexMetadata | undefined, b: TokenBondingV0 | undefined) => string;

export const Creator = React.memo(({ creator, getCreatorLink }: { creator: MetaplexCreator, getCreatorLink: GetCreatorLink }) => {
  const { metadata, tokenBonding } = useSocialTokenMetadata(creator.address);

  return <Link
    to={getCreatorLink(creator, metadata, tokenBonding)}
  >
    <Badge
      color={metadata ? "primary" : "neutral"}
    >
      <div className="truncate max-w-18">
        {metadata?.data.name || creator.address.toBase58()}
      </div>
    </Badge>
  </Link>
});
