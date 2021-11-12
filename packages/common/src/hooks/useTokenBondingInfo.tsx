import React, { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { ITokenBonding } from "@strata-foundation/spl-token-bonding";
import {
  usePublicKey,
  useTokenBonding,
  useTokenMetadata,
} from "@strata-foundation/react";
import { Avatar, MetadataAvatar } from "../";

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
  const tokenBondingKey = usePublicKey(
    tokenBonding ? tokenBonding : PublicKey.default.toBase58()
  );

  const { info: tokenBondingInfo, loading: tokenBondingInfoLoading } =
    useTokenBonding(tokenBondingKey);

  const {
    metadata,
    image,
    error: metadataError,
    loading: metadataLoading,
  } = useTokenMetadata(tokenBondingInfo?.targetMint);

  useEffect(() => {
    const run =
      tokenBondingKey &&
      !tokenBondingKey.equals(PublicKey.default) &&
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
