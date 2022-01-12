import React, { useState, useRef } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  StackDivider,
  Text,
  Button,
} from "@chakra-ui/react";
import { HiOutlineArrowsExpand } from "react-icons/hi";
import { MetadataCategory } from "@strata-foundation/spl-utils";
import { PublicKey } from "@solana/web3.js";
import {
  useTokenMetadata,
  useErrorHandler,
  IUseTokenMetadataResult,
} from "@strata-foundation/react";
import { Creator, GetCreatorLink } from "./";
// @ts-ignore
import { ExpandedNft } from "./ExpandedNft";
import { NftSmallView } from "./NftSmallView";
import { Link } from "react-router-dom";

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
    tagNftPath,
    modalRef,
  }: {
    token: IUseTokenMetadataResult;
    owner: PublicKey | undefined;
    getCreatorLink: GetCreatorLink;
    tagNftPath?: string;
    modalRef?: React.MutableRefObject<HTMLInputElement>;
  }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    console.log("Metadata: ", token.metadataKey?.toBase58());

    /* const { connected } = useWallet(); */

    /* if (!connected && taggingMode) {
     *   return <WalletSelect />;
     * } */

    return (
      <>
        <VStack w="full">
          <NftSmallView
            actionIcon={HiOutlineArrowsExpand}
            onActionClick={() => setIsExpanded(true)}
            token={token}
          />
          <VStack
            w="full"
            spacing={4}
            padding={4}
            divider={<StackDivider borderColor="gray.200" />}
            align="stretch"
          >
            <VStack w="full" spacing={2} alignItems="start">
              <Flex
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="sm"
              >
                {displayName(token.data?.properties?.category)} &bull;{" "}
                {token.edition
                  ? `Editon no. ${token.edition.edition.toNumber()} of ${token.masterEdition?.supply.toNumber()}`
                  : token.masterEdition
                  ? "Master Edition"
                  : "No Edition or Master Edition"}
              </Flex>
              {token.metadata && (
                <>
                  <HStack alignItems="center" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.900">
                      Owner:
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.500"
                      _hover={{ color: "indigo.600" }}
                    >
                      {owner ? (
                        <Creator
                          creator={owner}
                          getCreatorLink={getCreatorLink}
                        />
                      ) : (
                        "Unknown"
                      )}
                    </Text>
                  </HStack>
                  <HStack alignItems="center" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.900">
                      Authority:
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.500"
                      _hover={{ color: "indigo.600" }}
                    >
                      <Creator
                        creator={new PublicKey(token.metadata.updateAuthority)}
                        getCreatorLink={getCreatorLink}
                      />
                    </Text>
                  </HStack>
                  <HStack alignItems="center" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.900">
                      Created by:
                    </Text>
                    <Flex
                      direction="row"
                      flexWrap="wrap"
                      align="start"
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.500"
                      _hover={{ color: "indigo.600" }}
                    >
                      {token.metadata?.data.creators
                        ?.filter((c) => c.verified)
                        .map((creator) => (
                          <Creator
                            key={creator.address}
                            creator={new PublicKey(creator.address)}
                            getCreatorLink={getCreatorLink}
                          />
                        ))}
                    </Flex>
                  </HStack>
                </>
              )}
              {token.image && token.metadataKey && tagNftPath && (
                <Link to={tagNftPath}>
                  <Button size="md" colorScheme="indigo">
                    Verify
                  </Button>
                </Link>
              )}
            </VStack>
            <Flex fontSize="sm">{token.description}</Flex>
            {
              // @ts-ignore
              sanitizeStarAtlas(token.data?.attributes).map(
                ({ trait_type, display_type, value }: Attribute) => (
                  <HStack spacing={2} key={trait_type}>
                    <Text fontSize="sm" color="gray.500" w={24}>
                      {trait_type}
                    </Text>
                    <Text fontSize="sm">{value}</Text>
                  </HStack>
                )
              )
            }
          </VStack>
        </VStack>
        <ExpandedNft
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          tokenData={token}
          portalProps={{
            containerRef: modalRef,
          }}
        />
      </>
    );
  }
);

/**
 * Normal nfts have an attributes array. But star atlas didn't follow that.
 *
 * @param attributes
 */
function sanitizeStarAtlas(attributes?: any): any[] {
  if (!attributes) {
    return [];
  }
  if (Array.isArray(attributes)) {
    return attributes;
  }

  return Object.entries(attributes).map(([key, value]) => ({
    trait_type: key,
    value: value,
  }));
}

export const ViewNft = React.memo(
  ({
    token,
    owner,
    getCreatorLink,
    tagNftPath,
    modalRef,
  }: {
    token?: PublicKey;
    owner: PublicKey | undefined;
    getCreatorLink: GetCreatorLink;
    tagNftPath?: string;
    modalRef?: React.MutableRefObject<HTMLInputElement>;
  }) => {
    const { handleErrors } = useErrorHandler();
    const tokenWithMeta = useTokenMetadata(token);

    handleErrors(tokenWithMeta.error);

    return (
      <ViewNftRaw
        token={tokenWithMeta}
        owner={owner}
        getCreatorLink={getCreatorLink}
        tagNftPath={tagNftPath}
        modalRef={modalRef}
      />
    );
  }
);
