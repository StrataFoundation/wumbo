import React from "react";
import { PublicKey } from "@solana/web3.js";
import { SimpleGrid, Box, Center } from "@chakra-ui/react";
import { NftCard } from "./NftCard";
import { Spinner } from "../Spinner";
import {
  ITokenWithMeta,
  ITokenWithMetaAndAccount,
  useUserTokensWithMeta,
} from "../utils";
import { handleErrors } from "../contexts";

export const NftListRaw = React.memo(
  ({
    tokens,
    getLink,
    loading = !!tokens,
  }: {
    tokens?: ITokenWithMetaAndAccount[];
    getLink: (t: ITokenWithMeta) => string;
    loading?: boolean;
  }) => {
    if (loading) {
      return <Spinner />;
    }

    if (!tokens?.length) {
      return (
        <Box w="full" h="full">
          <Center
            padding={4}
            rounded="lg"
            fontSize="lg"
            fontWeight="medium"
            color="gray.400"
            bgColor="gray.100"
          >
            No tokens found
          </Center>
        </Box>
      );
    }

    return (
      <SimpleGrid w="full" minChildWidth="93px" spacing={4}>
        {tokens
          .filter((t) => t.masterEdition || (t.account?.amount.toNumber() == 1 && t.mint?.decimals === 0))
          .map((token) => (
            <Box key={token.publicKey?.toBase58()} height="156px" w="full">
              <NftCard getLink={getLink} token={token} />
            </Box>
          ))}
      </SimpleGrid>
    );
  }
);

export const NftList = React.memo(
  ({
    owner,
    getLink,
  }: {
    owner?: PublicKey;
    getLink: (t: ITokenWithMeta) => string;
  }) => {
    const { result: tokens, loading, error } = useUserTokensWithMeta(owner);
    handleErrors(error);
    return <NftListRaw getLink={getLink} loading={loading} tokens={tokens} />;
  }
);
