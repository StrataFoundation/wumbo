import { useState, useEffect } from "react";
import { useConnection } from "../contexts/connection";
import { PublicKey, RpcResponseAndContext, TokenAccountBalancePair } from "@solana/web3.js";

// wouldb eventually like to collocate all token related hooks here
// use them for composing into larget hooks.

export const useTokenLargestAccounts = (
  tokenMint: PublicKey | undefined
): {
  loading: boolean;
  result: RpcResponseAndContext<TokenAccountBalancePair[]> | undefined;
  error: Error | undefined;
} => {
  const connection = useConnection();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<
    RpcResponseAndContext<TokenAccountBalancePair[]> | undefined
  >();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    (async () => {
      if (tokenMint) {
        setLoading(true);
        try {
          const result = await connection.getTokenLargestAccounts(tokenMint);
          setResult(result);
        } catch (e) {
          setError(e);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [tokenMint]);

  return { loading, result, error };
};
