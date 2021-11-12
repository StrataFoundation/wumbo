import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { u64, AccountLayout } from "@solana/spl-token";
import {
  useBuy,
  useSell,
  useMint,
  useBondingPricing,
  useOwnedAmount,
  useSolOwnedAmount,
  amountAsNum,
  useEstimatedFees,
  useTokenMetadata,
} from "@strata-foundation/react";
import {
  SOL_TOKEN,
  WUM_TOKEN,
  useTokenBondingInfo,
  handleErrors,
  Spinner,
  SolanaIcon,
  WumboIcon,
  Notification,
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
  const {
    metadata: wumMeta,
    loading: wumMetaLoading,
    error: wumMetaError,
  } = useTokenMetadata(WUM_TOKEN);
  const [buy, { loading: buyLoading, error: buyError }] = useBuy();
  const [sell, { loading: sellLoading, error: sellError }] = useSell();
  const [internalError, setInternalError] = useState<Error | undefined>();
  const [spendCap, setSpendCap] = useState<number>(0);
  const { amount: feeAmount, error: feeError } = useEstimatedFees(
    AccountLayout.span,
    1
  );
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

  handleErrors(
    wumMetaError,
    buyError,
    feeError,
    sellError,
    tokenBondingError,
    internalError
  );

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
    wumMetaLoading ||
    tokenBondingLoading ||
    curveLoading ||
    solLoading ||
    !tokenBonding ||
    !curve ||
    !wumMeta
  ) {
    return <Spinner />;
  }

  const { name = "", ticker = "", icon, publicKey } = tokenBonding;

  const base = isBaseSol
    ? {
        name: "SOL",
        ticker: "SOL",
        icon: <SolanaIcon w="full" h="full" />,
        publicKey: SOL_TOKEN,
      }
    : {
        name: wumMeta.data.name,
        ticker: wumMeta.data.symbol,
        icon: <WumboIcon w="full" h="full" />,
        publicKey: WUM_TOKEN,
      };

  const target = isBaseSol
    ? {
        name: wumMeta.data.name,
        ticker: wumMeta.data.symbol,
        icon: <WumboIcon w="full" h="full" />,
        publicKey: WUM_TOKEN,
      }
    : { name, ticker, icon, publicKey };

  const handleSubmit = async (values: ISwapFormValues) => {
    const { ticker: notificationTicker } = isBuying ? target : base;

    if (values.topAmount) {
      try {
        if (isBuying) {
          await buy(
            tokenBonding.publicKey,
            +values.bottomAmount,
            +values.slippage / 100
          );
        } else {
          await sell(
            tokenBonding.publicKey,
            +values.topAmount,
            +values.slippage / 100
          );
        }

        toast.custom((t) => (
          <Notification
            show={t.visible}
            type="success"
            heading="Transaction Succesful"
            message={`You now own ${Number(values.bottomAmount).toFixed(
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
      feeAmount={feeAmount}
    />
  );
};
