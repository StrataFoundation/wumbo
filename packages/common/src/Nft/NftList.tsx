import { Box, Center, SimpleGrid } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import {
  TokenAccount,
  useErrorHandler,
  useMetaplexTokenMetadata,
  useWalletTokenAccounts,
} from "@strata-foundation/react";
import { ITokenWithMeta } from "@strata-foundation/spl-utils";
import React from "react";
import { Spinner } from "../Spinner";
import { NftCard } from "./NftCard";

export const MaybeNft = React.memo(
  ({
    tokenAccount,
    filter,
    getLink,
  }: {
    tokenAccount: TokenAccount;
    filter?: (t: ITokenWithMeta) => boolean;
    getLink: (t: ITokenWithMeta) => string;
  }) => {
    const metadata = useMetaplexTokenMetadata(tokenAccount.info.mint);

    if (
      (filter && !filter(metadata)) ||
      metadata.mint?.decimals != 0 ||
      !metadata.metadata
    ) {
      return null;
    }

    return (
      <Box height="156px" w="full">
        <NftCard getLink={getLink} token={metadata} />
      </Box>
    );
  }
);

export const NftListRaw = React.memo(
  ({
    tokenAccounts,
    getLink,
    loading = !!tokenAccounts,
    filter,
  }: {
    tokenAccounts?: TokenAccount[];
    getLink: (t: ITokenWithMeta) => string;
    loading?: boolean;
    filter?: (t: ITokenWithMeta) => boolean;
  }) => {
    if (loading) {
      return <Spinner />;
    }

    if (!tokenAccounts?.length) {
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
        {tokenAccounts.map((tokenAccount) => (
          <MaybeNft
            getLink={getLink}
            key={tokenAccount.pubkey.toBase58()}
            filter={filter}
            tokenAccount={tokenAccount}
          />
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
    const { handleErrors } = useErrorHandler();
    const {
      result: tokenAccounts,
      loading,
      error,
    } = useWalletTokenAccounts(owner);

    handleErrors(error);
    return (
      <NftListRaw
        getLink={getLink}
        loading={loading}
        tokenAccounts={tokenAccounts}
      />
    );
  }
);
