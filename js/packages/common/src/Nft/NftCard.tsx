import React from "react";
import { ITokenWithMeta } from "../utils/metaplex/nftMetadataHooks";
import { Badge } from "../Badge";
import { Link } from "react-router-dom";
import { Nft } from "./Nft";

export const NftCard = React.memo(
  ({
    token,
    getLink,
  }: {
    token: ITokenWithMeta;
    getLink: (t: ITokenWithMeta) => string;
  }) => {
    return (
      <Link to={getLink(token)}>
        <div className="hover:shadow-lg h-40 w-24 flex flex-col bg-white shadow-sm rounded-lg border-1 overflow-hidden">
          <div className="bg-gray-100 h-24 overflow-hidden">
            {token.data && (
              <Nft
                meshEnabled={false}
                className="h-24 object-cover"
                data={token.data}
              />
            )}
          </div>
          <div className="p-2 flex flex-col space-y-1">
            <span className="truncate text-sm font-extrabold">
              {token.metadata?.data.name}
            </span>
            {token.masterEdition && (
              <div className="flex flex-row">
                <Badge size="sm">
                  {token.masterEdition && !token.edition && "NFT 0"}
                  {token.edition &&
                    `${token.edition.edition.toNumber()} of ${token.masterEdition?.supply.toNumber()}`}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }
);
