import React from "react";
import { Flex, Box, Tag, Text } from "@chakra-ui/react";
import { ITokenWithMeta } from "../utils/metaplex/nftMetadataHooks";
import { Link } from "react-router-dom";
import { Nft } from "./Nft";

export const NftCard = React.memo(
  ({
    token,
    getLink,
  }: {
    token: ITokenWithMeta;
    getLink: (t: ITokenWithMeta) => string;
  }) => (
    <Flex
      w="full"
      flexDirection="column"
      borderWidth="1px"
      borderColor="gray.200"
      rounded="lg"
      _hover={{ opacity: "0.5" }}
      as={Link}
      to={getLink(token)}
    >
      <Flex
        w="full"
        padding={2}
        bgColor="gray.200"
        alignItems="center"
        justifyContent="center"
      >
        <Box w={20} height={20}>
          {token.data && (
            <Nft image={token.image} meshEnabled={false} data={token.data} />
          )}
        </Box>
      </Flex>
      <Flex w="full" flexDirection="column" padding={2} alignItems="start">
        <Text
          w="full"
          fontWeight="semibold"
          fontSize="14px"
          marginTop={2}
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {token.metadata?.data.name}
        </Text>

        {token.masterEdition && (
          <Tag fontSize="xs" marginTop={2}>
            {token.masterEdition && !token.edition && "Master"}
            {token.edition &&
              `${token.edition.edition.toNumber()} of ${token.masterEdition?.supply.toNumber()}`}
          </Tag>
        )}
      </Flex>
    </Flex>
  )
);
