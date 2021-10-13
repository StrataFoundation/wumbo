import React from "react";
import { IconButton, Flex, VStack, Icon } from "@chakra-ui/react";
import { ITokenWithMeta } from "../utils";
import { Nft } from "./Nft";

export const NftSmallView = React.memo(
  ({
    token,
    actionIcon,
    onActionClick,
  }: {
    token: ITokenWithMeta;
    actionIcon: any;
    onActionClick: () => void;
  }) => {
    return (
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
            image={token.image}
            data={token.data}
            // @ts-ignore
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
          icon={<Icon as={actionIcon} />}
          onClick={onActionClick}
        />
      </VStack>
    );
  }
);
