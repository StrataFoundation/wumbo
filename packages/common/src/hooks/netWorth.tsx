import { ApolloError, gql, useQuery } from "@apollo/client";
import { PublicKey } from "@solana/web3.js";

const GET_NET_WORTH = gql`
  query GetNetWorth($wallet: String!) {
    wumNetWorth(wallet: $wallet)
  }
`;

export function useWumNetWorth(wallet: PublicKey | undefined): {
  wumNetWorth: number | undefined;
  error: ApolloError | undefined;
  loading: boolean;
} {
  const {
    data: { wumNetWorth } = {},
    error,
    loading,
  } = useQuery<{ wumNetWorth: number }>(GET_NET_WORTH, {
    variables: {
      wallet: wallet?.toBase58(),
    },
  });

  return {
    wumNetWorth,
    loading,
    error,
  };
}
