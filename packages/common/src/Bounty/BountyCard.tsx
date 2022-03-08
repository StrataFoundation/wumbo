import {
  Box,
  HStack,
  Image,
  Skeleton,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { numberWithCommas } from "@strata-foundation/marketplace-ui";
import {
  useReserveAmount,
  useTokenBondingFromMint,
  useTokenMetadata,
} from "@strata-foundation/react";
import React from "react";

export const BountyCard = ({
  mintKey,
  onClick,
}: {
  mintKey: PublicKey;
  onClick: () => void;
}) => {
  const { image, displayName, loading } = useTokenMetadata(mintKey);
  const { info: tokenBonding, loading: bondingLoading } =
    useTokenBondingFromMint(mintKey);
  const reserveAmount = useReserveAmount(tokenBonding?.publicKey);
  const { metadata, loading: loadingMetadata } = useTokenMetadata(
    tokenBonding?.baseMint
  );

  return (
    <HStack
      onClick={onClick}
      _hover={{ backgroundColor: "gray.200", cursor: "pointer" }}
      spacing={4}
      rounded="lg"
      padding={2}
      borderWidth="1px"
      borderColor="gray.200"
      w="full"
    >
      <Image
        src={image}
        alt={displayName}
        rounded="lg"
        w="56px"
        h="56px"
        objectFit="cover"
      />
      <VStack spacing={2} align="left">
        {loading ? (
          <Skeleton w="250px" />
        ) : (
          <Text fontWeight={600} fontSize="14px">
            {displayName}
          </Text>
        )}
        <Box>
          {reserveAmount ? (
            <Tag fontSize="10px">
              <HStack spacing={"3px"}>
                <Text fontWeight={700}>
                  {numberWithCommas(reserveAmount, 4)}
                </Text>
                <span>{metadata?.data.symbol}</span>
                <Text color="gray.400">Contributed</Text>
              </HStack>
            </Tag>
          ) : (
            <Skeleton w="200px" />
          )}
        </Box>
      </VStack>
    </HStack>
  );
};
