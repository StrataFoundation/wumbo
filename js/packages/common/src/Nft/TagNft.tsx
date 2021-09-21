import React, { useState, useRef } from "react";
import {
  VStack,
} from "@chakra-ui/react";
import { HiOutlineRefresh } from "react-icons/hi";
import { PublicKey } from "@solana/web3.js";
import { ITokenWithMeta, useTokenMetadata } from "../utils";
import { GetCreatorLink, TaggableImages } from "./";
// @ts-ignore
import { handleErrors } from "../contexts";
import { NftSmallView } from "./NftSmallView"

export const TagNftRaw = React.memo(
  ({
    token,
  }: {
    token: ITokenWithMeta;
  }) => {
    const [refreshCounter, setRefreshCounter] = useState<number>(0);
    const incRefreshCounter = () => setRefreshCounter(refreshCounter + 1);

    // TODO expand logic

    // TODO add redirect logic to site wallet
    /* const { connected } = useWallet(); */

    /* if (!connected && taggingMode) {
     *   return <WalletSelect />;
     * } */

    return (
      <>
        <VStack w="full">
          <NftSmallView
            actionIcon={HiOutlineRefresh}
            onActionClick={incRefreshCounter}
            token={token}
          />
          <TaggableImages
            src={token.image!}
            metadata={token.metadataKey!}
            refreshCounter={refreshCounter}
          />
        </VStack>
      </>
    );
  }
);

export const TagNft = React.memo(
  ({
    token,
  }: {
    token?: PublicKey;
  }) => {
    const tokenWithMeta = useTokenMetadata(token);
    handleErrors(tokenWithMeta.error);

    return (
      <TagNftRaw
        token={tokenWithMeta}
      />
    );
  }
);
