import { Box, Flex, Text } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { useErrorHandler, useTokenMetadata } from "@strata-foundation/react";
import React from "react";
import { Avatar, Spinner } from "..";
import { truncatePubkey } from "../utils";

export const UserLeaderboardElement = React.memo(
  ({
    amount,
    displayKey,
    onClick,
    mint,
  }: {
    onClick?: () => void;
    displayKey: PublicKey | undefined;
    amount: string | undefined;
    mint: PublicKey | undefined;
  }) => {
    const { metadata, image, loading, error } = useTokenMetadata(mint);

    const name =
      metadata?.data.name || (displayKey && truncatePubkey(displayKey));
    const symbol = metadata?.data.symbol;

    const { handleErrors } = useErrorHandler();

    handleErrors(error);

    if (loading) {
      return <Spinner />;
    }

    return (
      <Flex
        flexDirection="row"
        flexGrow={1}
        alignItems="center"
        paddingRight={4}
        onClick={() => onClick && onClick()}
      >
        <Box paddingY={2} paddingRight={4} paddingLeft={1}>
          {image && <Avatar size="xs" src={image} name={name} />}
        </Box>
        <Flex
          flexGrow={1}
          flexDirection="column"
          minH={8}
          justifyContent="center"
        >
          <Text
            maxW="140px"
            fontSize="sm"
            color="gray.700"
            overflow="hidden"
            isTruncated
          >
            {name}
          </Text>
          {symbol && name && (
            <Text
              isTruncated
              fontSize="xs"
              fontWeight="semiBold"
              color="gray.400"
            >
              {symbol} | {name}
            </Text>
          )}
        </Flex>
        <Flex
          alignItems="center"
          fontSize="sm"
          fontWeight="semibold"
          color="gray.400"
        >
          {amount}
        </Flex>
      </Flex>
    );
  }
);
