import { useState, useEffect } from "react";
import { useConnection } from "@oyster/common";
import {
  PublicKey,
  RpcResponseAndContext,
  TokenAccountBalancePair,
} from "@solana/web3.js";
import { useWallet } from "../contexts";
import { getReverseTokenRefKey, getUserTokenAccounts } from "../utils";

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

export const useUserSocialTokens = (): {
  loading: boolean;
  result: any[];
  error: Error | undefined;
} => {
  const connection = useConnection();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any[]>([]);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    (async () => {
      if (publicKey) {
        setLoading(true);
        try {
          const userTokenAccounts = await getUserTokenAccounts(
            connection,
            publicKey
          );

          const reverseRefs = await Promise.all(
            userTokenAccounts.map(async ({ info: { mint } }) => {
              return await connection.getAccountInfo(
                await getReverseTokenRefKey(mint)
              );
            })
          );

          console.log("Test", reverseRefs.filter(Boolean));
          // get all token accounts
          // filter to ones with tokenRefs
          // do something
          setResult(userTokenAccounts);
        } catch (e) {
          setError(e);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [publicKey]);

  return { loading, result, error };
};
