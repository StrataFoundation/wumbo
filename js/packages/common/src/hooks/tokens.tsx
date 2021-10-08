import React, { useState, useEffect } from "react";
import { useAsyncCallback } from "react-async-hook";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  PublicKey,
  RpcResponseAndContext,
  TokenAccountBalancePair,
} from "@solana/web3.js";
import BN from "bn.js";
import isEqual from "lodash/isEqual";
import {
  useConnection,
  usePrograms,
  useWallet,
  useAccount,
  TokenBonding,
  useTokenMetadata,
  ITokenBonding,
  Avatar,
  MetadataAvatar,
} from "../";

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
  icon?: React.ReactElement;
}

export const useTokenBondingInfo = (
  tokenBonding: string | undefined,
  avatarSize: "sm" | "md" | "lg" = "sm"
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
            icon: (
              <MetadataAvatar
                size={avatarSize}
                tokenBonding={tokenBondingInfo}
                name={metadata.data.name || "UNCLAIMED"}
              />
            ),
            ...tokenBondingInfo!,
          });
        } else {
          setResult({
            ticker: "UNCLAIMED",
            name: "UNCLAIMED",
            icon: <Avatar size={avatarSize} src={image} name={"UNCLAIMED"} />,
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

export const useBuyToken = (): [
  (tokenBonding: PublicKey, amount: number, maxPrice: number) => Promise<void>,
  { data: any; loading: boolean; error: Error | undefined }
] => {
  const { connected, publicKey } = useWallet();
  const { splTokenBondingProgram } = usePrograms();

  const {
    result: data,
    execute: buy,
    error,
    loading,
  } = useAsyncCallback(async (tokenBonding, amount, slippage) => {
    if (!connected || !publicKey) throw new WalletNotConnectedError();

    await splTokenBondingProgram!.buyV0({
      tokenBonding,
      desiredTargetAmount: new BN(Math.floor(amount * Math.pow(10, 9))),
      slippage,
    });
  });

  return [buy, { data, loading, error }];
};

export const useSellToken = (): [
  (tokenBonding: PublicKey, amount: number, minPrice: number) => Promise<void>,
  { data: any; loading: boolean; error: Error | undefined }
] => {
  const { connected, publicKey } = useWallet();
  const { splTokenBondingProgram } = usePrograms();
  const {
    result,
    loading,
    execute: sell,
    error,
  } = useAsyncCallback(async (tokenBonding, amount, slippage) => {
    if (!connected || !publicKey) throw new WalletNotConnectedError();

    await splTokenBondingProgram!.sellV0({
      tokenBonding,
      targetAmount: new BN(Math.floor(amount * Math.pow(10, 9))),
      slippage,
    });
  });

  return [sell, { data: result, loading, error }];
};
