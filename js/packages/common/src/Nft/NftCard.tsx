import React from "react";
import { ITokenWithMeta } from "../utils/metaplex/nftMetadataHooks";
import { Badge } from "../Badge";
import { Link } from "react-router-dom";
import { Nft } from "./Nft";

export const NftCard = React.memo(
  ({ token, getLink }: { token: ITokenWithMeta; getLink: (t: ITokenWithMeta) => string }) => {
    return (
      <Link
        to={getLink(token)}
        className="flex-1 flex flex-col rounded-lg items-center overflow-hidden hover:opacity-25"
      >
        <div className="flex justify-center w-full">
          {token.data && (
            <Nft
              meshEnabled={false}
              className="w-24 h-24 object-cover rounded-lg"
              data={token.data}
            />
          )}
        </div>
        <div className="pt-2 flex flex-col w-full space-y-1 text-center">
          <span className="truncate text-sm font-bold">{token.metadata?.data.name}</span>
          {token.masterEdition && (
            <div className="flex flex-row justify-center">
              <Badge size="sm">
                {token.masterEdition && !token.edition && "Master"}
                {token.edition &&
                  `${token.edition.edition.toNumber()} of ${token.masterEdition?.supply.toNumber()}`}
              </Badge>
            </div>
          )}
        </div>
      </Link>
    );
  }
);
