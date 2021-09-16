import React, { Fragment, useState } from "react";
import { MetadataCategory, useWallet } from "@oyster/common";
import { PublicKey } from "@solana/web3.js";
import { HiOutlineRefresh, HiOutlineArrowsExpand } from "react-icons/hi";
import { ITokenWithMeta, useTokenMetadata } from "../utils";
import { Nft, Creator, GetCreatorLink, TaggableImages } from "./";
// @ts-ignore
import { WalletSelect } from "../Pages/WalletSelect";
import { Button } from "../";
import { ExpandedNft } from "./ExpandedNft";

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
    owner,
    getCreatorLink,
  }: {
    token: ITokenWithMeta;
    owner: PublicKey | undefined;
    getCreatorLink: GetCreatorLink;
  }) => {
    const [taggingMode, setTaggingMode] = useState<boolean>(false);
    const [refreshCounter, setRefreshCounter] = useState<number>(0);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const incRefreshCounter = () =>
      taggingMode && setRefreshCounter(refreshCounter + 1);

    const handleNftAction = (taggingMode: boolean) => {
      if (taggingMode) incRefreshCounter();
      if (!taggingMode) setIsExpanded(true);
    };

    // TODO expand logic

    // TODO add redirect logic to site wallet
    /* const { connected } = useWallet(); */

    /* if (!connected && taggingMode) {
     *   return <WalletSelect />;
     * } */

    return (
      <Fragment>
        <div>
          <div className="flex flex-col relative py-6 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600">
            <div
              onClick={() => handleNftAction(taggingMode)}
              className="text-white absolute right-4 top-4 bg-gray-900 bg-opacity-30 rounded-full p-1.5 hover:bg-opacity-40 hover:cursor-pointer"
            >
              {taggingMode && <HiOutlineRefresh width={26} />}
              {!taggingMode && <HiOutlineArrowsExpand width={26} />}
            </div>
            {token.data && (
              <Nft className="w-44 m-auto rounded-lg" data={token.data} />
            )}
            <span className="pt-2 text-white text-center text-2xl font-medium">
              {token.metadata?.data.name}
            </span>
          </div>
          <div className="px-4 py-4">
            {taggingMode && (
              <TaggableImages
                src={token.image!}
                metadata={token.metadataKey!}
                refreshCounter={refreshCounter}
              />
            )}
            {!taggingMode && (
              <div className="grid grid-cols-1 divide-y divide-gray-200">
                <dl className="pb-6 flex-grow flex flex-col justify-between">
                  <dd className="text-gray-500 text-sm">
                    {displayName(token.data?.properties.category)} •{" "}
                    {token.edition
                      ? `Edition no. ${token.edition.edition.toNumber()} of ${token.masterEdition?.supply.toNumber()}`
                      : "Master Edition"}
                  </dd>
                  {token.metadata && (
                    <Fragment>
                      <dd className="pt-3">
                        <p className="text-sm text-gray-900 font-bold">
                          Owner:
                        </p>
                        <span className="text-sm text-gray-500 font-medium break-words hover:text-indigo-600">
                          {owner ? (
                            <Creator
                              creator={owner}
                              getCreatorLink={getCreatorLink}
                            />
                          ) : (
                            <span>Unknown</span>
                          )}
                        </span>
                      </dd>
                      <dd className="pt-3">
                        <p className="text-sm text-gray-900 font-bold">
                          Authority:
                        </p>
                        <span className="text-sm text-gray-500 font-medium break-words hover:text-indigo-600">
                          <Creator
                            creator={token.metadata.updateAuthority}
                            getCreatorLink={getCreatorLink}
                          />
                        </span>
                      </dd>
                      <dd className="pt-3">
                        <p className="text-sm text-gray-900 font-bold">
                          Created by:
                        </p>
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
                {token.image && token.metadataKey && (
                  <div className="py-6 divide-y divide-gray-200">
                    <div className="flex">
                      <div className="w-0 flex-1 flex">
                        <Button onClick={() => setTaggingMode(true)}>
                          Tag
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-sm py-6">{token.description}</div>
                {
                  // @ts-ignore
                  (token.data?.attributes || []).map(
                    ({ trait_type, display_type, value }: Attribute) => (
                      <div className="py-6 flex flex-row">
                        <div className="text-sm text-gray-500 w-32">
                          {trait_type}
                        </div>
                        <span className="text-sm">{value}</span>
                      </div>
                    )
                  )
                }
              </div>
            )}
          </div>
        </div>
        <ExpandedNft
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          tokenData={token}
        />
      </Fragment>
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

    return (
      <ViewNftRaw
        token={tokenWithMeta}
        owner={owner}
        getCreatorLink={getCreatorLink}
      />
    );
  }
);
