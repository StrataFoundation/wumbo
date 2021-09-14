import React, { Fragment, useState } from "react";
import { ITokenWithMeta, useTokenMetadata } from "../utils/metaplex/nftMetadataHooks";
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

function displayName(category: MetadataCategory | undefined): string | undefined {
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
    owner,
    getCreatorLink,
  }: {
    token: ITokenWithMeta;
    owner: PublicKey | undefined;
    getCreatorLink: GetCreatorLink;
  }) => {
    const [taggingMode, setTaggingMode] = useState(false);
    const { connected } = useWallet();

    if (!connected && taggingMode) {
      return <WalletSelect />;
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-1 text-">
        <div className="col-span-1 flex flex-col divide-y divide-gray-200">
          <div className="flex-1 flex flex-col">
            {token.data && (
              <div className="flex-shrink-0 mx-auto">
                <Nft className="w-full" data={token.data} />
              </div>
            )}
            <h3 className="pt-4 text-gray-900 text-3xl font-bold">{token.metadata?.data.name}</h3>
            {taggingMode && <TaggableImages src={token.image!} metadata={token.metadataKey!} />}
            {!taggingMode && (
              <dl className="pt-1 flex-grow flex flex-col justify-between">
                <dd className="text-gray-500 text-sm">
                  {displayName(token.data?.properties.category)} •{" "}
                  {token.edition
                    ? `Edition no. ${token.edition.edition.toNumber()} of ${token.masterEdition?.supply.toNumber()}`
                    : "Master Edition"}
                </dd>
                {token.metadata && (
                  <Fragment>
                    <dd className="pt-3">
                      <p className="text-sm text-gray-900 font-bold">Owner:</p>
                      <span className="text-sm text-gray-500 font-medium break-words hover:text-indigo-600">
                        {owner ? (
                          <Creator creator={owner} getCreatorLink={getCreatorLink} />
                        ) : (
                          <span>Unknown</span>
                        )}
                      </span>
                    </dd>
                    <dd className="pt-3">
                      <p className="text-sm text-gray-900 font-bold">Authority:</p>
                      <span className="text-sm text-gray-500 font-medium break-words hover:text-indigo-600">
                        <Creator
                          creator={token.metadata.updateAuthority}
                          getCreatorLink={getCreatorLink}
                        />
                      </span>
                    </dd>
                    <dd className="pt-3">
                      <p className="text-sm text-gray-900 font-bold">Created by:</p>
                      <span className="text-sm text-gray-500 font-medium break-words hover:text-indigo-600">
                        {token.metadata?.data.creators
                          ?.filter((c) => c.verified)
                          .map((creator) => (
                            <Creator
                              key={creator.address.toBase58()}
                              creator={creator.address}
                              getCreatorLink={getCreatorLink}
                            />
                          ))}
                      </span>
                    </dd>
                  </Fragment>
                )}
              </dl>
            )}
            {token.image && token.metadataKey && (
              <div className="py-6 divide-y divide-gray-200">
                <div className="flex">
                  <div className="w-0 flex-1 flex">
                    <Button onClick={() => setTaggingMode(true)}>Tag NFT</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-sm py-6">{token.description}</div>
          {
            // @ts-ignore
            (token.data?.attributes || []).map(({ trait_type, display_type, value }: Attribute) => (
              <div className="py-6 flex flex-row">
                <div className="text-sm text-gray-500 w-32">{trait_type}</div>
                <span className="text-sm">{value}</span>
              </div>
            ))
          }
        </div>
      </div>
    );
  }
);

export const ViewNft = React.memo(
  ({
    token,
    owner,
    getCreatorLink,
  }: {
    token?: PublicKey;
    owner: PublicKey | undefined;
    getCreatorLink: GetCreatorLink;
  }) => {
    const tokenWithMeta = useTokenMetadata(token);
    if (tokenWithMeta.error) {
      console.error(tokenWithMeta.error);
    }

    return <ViewNftRaw token={tokenWithMeta} owner={owner} getCreatorLink={getCreatorLink} />;
  }
);
