import { useState, useEffect } from "react";
import {
  PublicKey,
  RpcResponseAndContext,
  TokenAccountBalancePair,
} from "@solana/web3.js";
import isEqual from "lodash/isEqual";
import { useConnection } from "../contexts/connection";
import { useAccount, TokenBonding, useTokenMetadata } from "../";
import { ITokenBonding } from "utils";

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

interface IUseTokenBondingInfo extends ITokenBonding {
  name?: string;
  ticker?: string;
  iconSrc?: string;
}

export const useTokenBondingInfo = (
  tokenBonding: string | undefined
): {
  loading: boolean;
  result: IUseTokenBondingInfo | undefined;
  error: Error | undefined;
} => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IUseTokenBondingInfo | undefined>();
  const [error, setError] = useState<Error | undefined>();

  const tokenBondingKey = tokenBonding
    ? new PublicKey(tokenBonding)
    : PublicKey.default;

  const { info: tokenBondingInfo, loading: tokenBondingInfoLoading } =
    useAccount(tokenBondingKey, TokenBonding);

  const {
    metadata,
    image,
    error: metadataError,
    loading: metadataLoading,
  } = useTokenMetadata(tokenBondingInfo?.targetMint);

  useEffect(() => {
    const run =
      !isEqual(tokenBondingKey, PublicKey.default) &&
      !tokenBondingInfoLoading &&
      !!tokenBondingInfo &&
      !metadataLoading &&
      !!metadata;

    if (run) {
      setLoading(true);
      try {
        if (metadata) {
          setResult({
            ticker: metadata.data.symbol,
            name: metadata.data.name,
            iconSrc: metadata.data.uri,
            ...tokenBondingInfo!,
          });
        } else {
          setResult({
            ticker: "UNCLAIMED",
            name: undefined,
            iconSrc: image,
            ...tokenBondingInfo!,
          });
        }
      } catch (e) {
        setError(e);
      } finally {
        if (metadataError) setError(metadataError);
        setLoading(false);
      }
    }
  }, [tokenBondingInfoLoading, tokenBondingInfo, metadataLoading, metadata]);

  return { loading, result, error };
};
