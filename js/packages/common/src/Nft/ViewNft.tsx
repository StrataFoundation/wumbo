import React, { useState } from "react";
import {
  ITokenWithMeta,
  useTokenMetadata,
} from "../utils/metaplex/nftMetadataHooks";
import { Nft } from "./Nft";
import { MetadataCategory, useWallet } from "@oyster/common";
import { Button } from "../Button";
import { Creator, GetCreatorLink } from "./Creator";
import { PublicKey } from "@solana/web3.js";
// @ts-ignore
import { WalletSelect } from "../Pages/WalletSelect";
import { TaggableImages } from "./Tagging";

const displayNames = {
  vr: "VR",
  video: "Video",
  image: "Image",
  audio: "Audio",
};
function displayName(
  category: MetadataCategory | undefined
): string | undefined {
  return category && displayNames[category];
}

type Attribute = {
  trait_type?: string;
  display_type?: string;
  value: string | number;
};

export const ViewNftRaw = React.memo(
  ({
    token,
    getCreatorLink,
  }: {
    token: ITokenWithMeta;
    getCreatorLink: GetCreatorLink;
  }) => {
    const [taggingMode, setTaggingMode] = useState(false);
    const { connected } = useWallet();

    if (!connected && taggingMode) {
      return <WalletSelect />;
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-1">
        {token.data && <Nft className="w-full" data={token.data} />}
        <div className="p-2 flex flex-col space-y-2">
          <span className="text-2xl font-extrabold block">
            {token.metadata?.data.name}
          </span>

          {taggingMode && (
            <TaggableImages src={token.image!} metadata={token.metadataKey!} />
          )}

          {!taggingMode && (
            <div className="grid grid-cols divide-y">
              <div className="pb-4">
                <div className="space-y-2 pb-4">
                  <span className="font-medium">
                    {displayName(token.data?.properties.category)} •{" "}
                    {token.edition
                      ? `Edition no. ${token.edition.edition.toNumber()} of ${token.masterEdition?.supply.toNumber()}`
                      : "Master Edition"}
                  </span>
                  {token.metadata && (
                    <div className="font-medium flex flex-row">
                      <span>Creators:&nbsp;</span>
                      {token.metadata?.data.creators
                        ?.filter((c) => c.verified)
                        .map((creator) => (
                          <Creator
                            key={creator.address.toBase58()}
                            creator={creator.address}
                            getCreatorLink={getCreatorLink}
                          />
                        ))}
                      <span>•</span>
                      <span>Authority:&nbsp;</span>
                      {
                        <Creator
                          creator={token.metadata.updateAuthority}
                          getCreatorLink={getCreatorLink}
                        />
                      }
                    </div>
                  )}
                </div>
                {token.image && token.metadataKey && (
                  <Button onClick={() => setTaggingMode(true)}>Tag</Button>
                )}
              </div>

              <p className="py-4">{token.description}</p>

              {
                // @ts-ignore
                (token.data?.attributes || []).map(
                  ({ trait_type, display_type, value }: Attribute) => (
                    <div className="py-6 flex flex-row">
                      <div className="text-gray-500 w-32">{trait_type}</div>
                      <span>{value}</span>
                    </div>
                  )
                )
              }
            </div>
          )}
        </div>
      </div>
    );
  }
);

export const ViewNft = React.memo(
  ({
    token,
    getCreatorLink,
  }: {
    token?: PublicKey;
    getCreatorLink: GetCreatorLink;
  }) => {
    const tokenWithMeta = useTokenMetadata(token);
    if (tokenWithMeta.error) {
      console.error(tokenWithMeta.error);
    }

    return <ViewNftRaw token={tokenWithMeta} getCreatorLink={getCreatorLink} />;
  }
);
