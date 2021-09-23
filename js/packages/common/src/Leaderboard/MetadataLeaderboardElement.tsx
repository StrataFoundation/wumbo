import {
  amountAsNum,
  useAccount,
  useClaimedTokenRef,
  useClaimedTokenRefKey,
  useMint,
  useOwnedAmount,
  useSocialTokenMetadata,
  useTokenMetadata,
  useTwitterTokenRef,
  useUserOwnedAmount,
} from "../utils";
import React from "react";
import { AccountInfo as TokenAccountInfo, Token } from "@solana/spl-token";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Spinner } from "../Spinner";
import { Avatar } from "..";
import { useReverseTwitter } from "../utils/twitter";
import { PublicKey } from "@solana/web3.js";
import { handleErrors } from "../contexts";

export const MetadataLeaderboardElement = React.memo(
  ({
    mint,
    wallet,
    onClick,
  }: {
    onClick?: (tokenRefKey: PublicKey) => void;
    wallet: PublicKey;
    mint: PublicKey;
  }) => {
    const { loading, image, metadata, error } = useSocialTokenMetadata(wallet);
    handleErrors(error);
    const amount = useUserOwnedAmount(wallet, mint);

    const tokenRefKey = useClaimedTokenRefKey(wallet);

    const { handle, error: reverseTwitterError } = useReverseTwitter(wallet);
    handleErrors(error, reverseTwitterError);

    if (loading) {
      return <Spinner />;
    }

    const { name, symbol } = (metadata || {}).data || {};

    return (
      <Flex
        flexDirection="row"
        flexGrow={1}
        alignItems="center"
        paddingRight={4}
        onClick={() => onClick && tokenRefKey && onClick(tokenRefKey)}
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
            {name ? name : wallet.toBase58()}
          </Text>
          {symbol && handle && (
            <Text fontSize="xs" fontWeight="semiBold" color="gray.400">
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
          {amount?.toFixed(2)}
        </Flex>
      </Flex>
    );
  }
);
