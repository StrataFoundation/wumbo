import React from "react";
import { PublicKey } from "@solana/web3.js";
import { SimpleGrid, Box } from "@chakra-ui/react";
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
    if (!tokens || loading) {
      return <Spinner />;
    }

    return (
      <SimpleGrid w="full" minChildWidth="93px" spacing={4}>
        {tokens
          .filter((t) => t.masterEdition)
          .map((token) => (
            <Box height="156px" w="full">
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
