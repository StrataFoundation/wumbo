import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
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
  Notification,
  Icon,
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
  const isBuying = params.action === "buy";

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
  const isBaseSol = tokenBonding?.baseMint.equals(SOL_TOKEN);
  const ownedBase = isBaseSol ? ownedSol : ownedBaseNormal;
  const ownedTarget = useOwnedAmount(tokenBonding?.targetMint);

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

  if (
    tokenBondingLoading ||
    curveLoading ||
    solLoading ||
    !tokenBonding ||
    !curve
  ) {
    return <Spinner />;
  }

  const { name = "", ticker = "", icon } = tokenBonding;

  const base = isBaseSol
    ? {
        name: "SOL",
        ticker: "SOL",
        icon: <SolanaIcon w="full" h="full" />,
      }
    : {
        name: "WUM",
        ticker: "WUM",
        icon: <WumboIcon w="full" h="full" />,
      };

  const target = isBaseSol
    ? { name: "WUM", ticker: "WUM", icon: <WumboIcon w="full" h="full" /> }
    : { name, ticker, icon };

  const handleSubmit = async (values: ISwapFormValues) => {
    const { ticker: notificationTicker } = isBuying ? target : base;

    if (values.baseAmount) {
      try {
        if (isBuying) {
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

        toast.custom((t) => (
          <Notification
            show={t.visible}
            type="success"
            heading="Transaction Succesful"
            message={`You now own ${Number(values.targetAmount).toFixed(
              4
            )} of ${notificationTicker}`}
            onDismiss={() => toast.dismiss(t.id)}
          />
        ));
      } catch (e) {
        setInternalError(e);
      }
    }
  };

  // need to fix ownedBase
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
      base={isBuying ? base : target}
      target={isBuying ? target : base}
      ownedBase={isBuying ? ownedBase || 0 : ownedTarget || 0}
      spendCap={spendCap}
    />
  );
};
