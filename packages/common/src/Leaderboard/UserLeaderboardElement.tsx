import React from "react";
import { ITokenRef, useReverseTwitter, useTokenMetadata } from "../utils";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Avatar, Spinner } from "..";
import { handleErrors } from "../contexts";
import { PublicKey } from "@solana/web3.js";

export const UserLeaderboardElement = React.memo(
  ({
    amount,
    onClick,
    tokenRef,
  }: {
    onClick?: () => void;
    amount: string | undefined;
    tokenRef: ITokenRef | undefined;
  }) => {
    const { loading, image, metadata, error } = useTokenMetadata(
      tokenRef?.mint
    );
    const name = metadata?.data.name;
    const symbol = metadata?.data.symbol;
    const { handle: reverseTwitterHandle, error: reverseTwitterError } =
      useReverseTwitter(tokenRef?.owner as PublicKey | undefined);
    const handle = reverseTwitterHandle || name;

    handleErrors(error, reverseTwitterError);

    if (loading || !tokenRef) {
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
          {symbol && handle && (
            <Text
              isTruncated
              fontSize="xs"
              fontWeight="semiBold"
              color="gray.400"
            >
              {symbol} | @{handle}
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
