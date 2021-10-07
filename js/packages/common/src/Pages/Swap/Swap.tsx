import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { u64 } from "@solana/spl-token";
import {
  SOL_TOKEN,
  useBuyToken,
  useSellToken,
  useTokenBondingInfo,
  useMint,
  useBondingPricing,
  useOwnedAmount,
  useSolOwnedAmount,
  amountAsNum,
  handleErrors,
  Spinner,
  SolanaIcon,
  WumboIcon,
} from "../../";

import { ISwapFormValues, ISwapFormProps, SwapForm } from "./SwapForm";

interface ISwapProps
  extends Pick<
    ISwapFormProps,
    "onHandleConnectWallet" | "onHandleFlipTokens" | "onHandleBuyBase"
  > {}

export const Swap = ({
  onHandleConnectWallet,
  onHandleFlipTokens,
  onHandleBuyBase,
}: ISwapProps) => {
  const [buy, { loading: buyLoading, error: buyError }] = useBuyToken();
  const [sell, { loading: sellLoading, error: sellError }] = useSellToken();
  const [internalError, setInternalError] = useState<Error | undefined>();
  const [spendCap, setSpendCap] = useState<number>(0);
  const params =
    useParams<{ tokenBondingKey: string; action: "buy" | "sell" }>();

  const {
    loading: tokenBondingLoading,
    result: tokenBonding,
    error: tokenBondingError,
  } = useTokenBondingInfo(params.tokenBondingKey);

  const { loading: curveLoading, curve } = useBondingPricing(
    tokenBonding?.publicKey
  );
  const targetMint = useMint(tokenBonding?.targetMint);

  const { amount: ownedSol, loading: solLoading } = useSolOwnedAmount();
  const ownedBaseNormal = useOwnedAmount(tokenBonding?.baseMint);
  const ownedBase = tokenBonding?.baseMint.equals(SOL_TOKEN)
    ? ownedSol
    : ownedBaseNormal;

  handleErrors(buyError, sellError, tokenBondingError, internalError);

  useEffect(() => {
    if (tokenBonding && targetMint && curve) {
      const purchaseCap = tokenBonding.purchaseCap
        ? amountAsNum(tokenBonding.purchaseCap as u64, targetMint)
        : Number.POSITIVE_INFINITY;

      const maxSpend = curve.buyTargetAmount(
        purchaseCap,
        tokenBonding.baseRoyaltyPercentage,
        tokenBonding.targetRoyaltyPercentage
      );

      setSpendCap(maxSpend);
    }
  }, [tokenBonding, targetMint, curve, setSpendCap]);

  if (tokenBondingLoading || curveLoading || !tokenBonding || !curve) {
    return <Spinner />;
  }

  const handleSubmit = async (values: ISwapFormValues) => {
    if (values.baseAmount) {
      try {
        if (params.action === "buy") {
          await buy(
            tokenBonding.publicKey,
            +values.baseAmount,
            +values.slippage
          );
        } else {
          await sell(
            tokenBonding.publicKey,
            +values.baseAmount,
            +values.slippage
          );
        }
      } catch (e) {
        setInternalError(e);
      }
    }
  };

  return (
    <SwapForm
      action={params.action}
      isSubmitting={buyLoading || sellLoading}
      onHandleConnectWallet={onHandleConnectWallet}
      onHandleFlipTokens={onHandleFlipTokens}
      onHandleBuyBase={onHandleBuyBase}
      onHandleSubmit={handleSubmit}
      tokenBonding={tokenBonding}
      curve={curve}
      base={{ name: "SOL", ticker: "SOL", icon: <SolanaIcon /> }}
      target={{ name: "WUM", ticker: "WUM", icon: <WumboIcon /> }}
      ownedBase={ownedBase || 0}
      spendCap={spendCap}
    />
  );
};
