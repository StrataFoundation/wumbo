import React from 'react';
import { ITokenWithMeta } from '../utils/metaplex/useUserTokensWithMeta';
import { Badge } from '../Badge';
import { Edition, MasterEditionV1, MasterEditionV2 } from '@oyster/common';
import { Link } from 'react-router-dom';

export const NftCard = React.memo(({ token, getLink }: { token: ITokenWithMeta, getLink: (t: ITokenWithMeta) => string }) => {
  return <Link to={getLink(token)}>
    <div className="hover:shadow-lg min-w-30 flex flex-col bg-white shadow rounded-lg border-1">
      <div className="bg-gray-100">
        <img className="min-h-30 object-cover w-full" src={token.image} alt="" />
      </div>
      <div className="p-4 flex flex-col overflow-ellipsis overflow-hidden">
        <span className="title mb-2 font-bold block">{token.metadata?.data.name}</span>
        {token.masterEdition && <div className="flex flex-row">
          <Badge>
            {token.masterEdition && !token.edition && "NFT 0"}
            {token.edition && `${token.edition.edition.toNumber()} of ${token.masterEdition?.supply.toNumber()}`}
          </Badge>
        </div>}
      </div>
    </div>
  </Link>
})