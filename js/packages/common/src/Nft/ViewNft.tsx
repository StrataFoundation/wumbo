import React, { Fragment, useState, useRef } from "react";
import {
  IconButton,
  Box,
  Flex,
  VStack,
  HStack,
  StackDivider,
  Icon,
  Text,
  Button,
} from "@chakra-ui/react";
import { HiOutlineRefresh, HiOutlineArrowsExpand } from "react-icons/hi";
import { MetadataCategory, useWallet } from "@oyster/common";
import { PublicKey } from "@solana/web3.js";
import { ITokenWithMeta, useTokenMetadata } from "../utils";
import { Nft, Creator, GetCreatorLink, TaggableImages } from "./";
// @ts-ignore
import { WalletSelect } from "../Pages/WalletSelect";
import { ExpandedNft } from "./ExpandedNft";
import { handleErrors } from "../contexts";

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
    const portalRef = useRef() as React.MutableRefObject<HTMLInputElement>;
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
      <>
        <VStack w="full">
          <VStack
            width="full"
            alignItems="center"
            padding={4}
            spacing={4}
            position="relative"
            bgGradient="linear(to-tr, indigo.600, purple.600)"
          >
            {token.data && (
              <Nft
                data={token.data}
                imageProps={{ w: "110px", m: "auto", rounded: "lg" }}
              />
            )}
            <Flex
              w="full"
              color="white"
              justifyContent="center"
              fontWeight="md"
              fontSize="2xl"
            >
              {token.metadata?.data.name}
            </Flex>
            <IconButton
              margin="0px"
              position="absolute"
              top={0}
              right={2}
              rounded="full"
              colorScheme="purple"
              aria-label="NFT Action"
              size="md"
              fontSize={20}
              icon={
                <Icon
                  as={taggingMode ? HiOutlineRefresh : HiOutlineArrowsExpand}
                />
              }
              onClick={() => handleNftAction(taggingMode)}
            />
          </VStack>
          {taggingMode && (
            <TaggableImages
              src={token.image!}
              metadata={token.metadataKey!}
              refreshCounter={refreshCounter}
            />
          )}
          {!taggingMode && (
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
                  {displayName(token.data?.properties.category)} &bull;{" "}
                  {token.edition
                    ? `Editon no. ${token.edition.edition.toNumber()} of ${token.masterEdition?.supply.toNumber()}`
                    : "Master Edition"}
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
                          creator={token.metadata.updateAuthority}
                          getCreatorLink={getCreatorLink}
                        />
                      </Text>
                    </HStack>
                    <HStack alignItems="center" spacing={2}>
                      <Text fontSize="sm" fontWeight="bold" color="gray.900">
                        Created by:
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.500"
                        _hover={{ color: "indigo.600" }}
                      >
                        {token.metadata?.data.creators
                          ?.filter((c) => c.verified)
                          .map((creator) => (
                            <Creator
                              key={creator.address.toBase58()}
                              creator={creator.address}
                              getCreatorLink={getCreatorLink}
                            />
                          ))}
                      </Text>
                    </HStack>
                  </>
                )}
                {token.image && token.metadataKey && (
                  <Button
                    size="md"
                    colorScheme="indigo"
                    onClick={() => setTaggingMode(true)}
                  >
                    Tag
                  </Button>
                )}
              </VStack>
              <Flex fontSize="sm">{token.description}</Flex>
              {
                // @ts-ignore
                (token.data?.attributes || []).map(
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
          )}
        </VStack>
        <ExpandedNft
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          tokenData={token}
          portalProps={{
            containerRef: portalRef,
          }}
        />
        <Box ref={portalRef} />
      </>
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
    handleErrors(tokenWithMeta.error);

    return (
      <ViewNftRaw
        token={tokenWithMeta}
        owner={owner}
        getCreatorLink={getCreatorLink}
      />
    );
  }
);
