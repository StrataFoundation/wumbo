import { useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Signer,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ISwapDriverArgs,
  SwapForm,
  useBondingPricing,
  useErrorHandler,
  useMint,
  useMintTokenRef,
  usePriceInSol,
  useSwap,
  useSwapDriver,
} from "@strata-foundation/react";
import { ISwapArgs, toNumber } from "@strata-foundation/spl-token-bonding";
import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { WUMBO_TRANSACTION_FEE } from "../constants/globals";
import { useConfig } from "../hooks";

export const Swap = ({
  onTradingMintsChange,
  tokenBonding,
  baseMint,
  targetMint,
  manageWalletPath,
  swapConfirmationPath,
}: {
  tokenBonding?: PublicKey;
  baseMint?: PublicKey;
  targetMint?: PublicKey;
  manageWalletPath: string;
  swapConfirmationPath: string;
} & Pick<ISwapDriverArgs, "onTradingMintsChange">) => {
  const history = useHistory();
  const { wallet } = useWallet();
  const { handleErrors } = useErrorHandler();
  const { info: targetTokenRef, loading: loadingTarget } =
    useMintTokenRef(targetMint);
  const { info: baseTokenRef, loading: loadingBase } =
    useMintTokenRef(baseMint);
  const { pricing } = useBondingPricing(tokenBonding);
  const baseMintInfo = useMint(baseMint);
  const targetMintInfo = useMint(targetMint);
  const wumboConfig = useConfig();
  const hasFees = targetTokenRef || baseTokenRef;
  const lowestMint = useMemo(() => {
    const arr = pricing?.hierarchy.toArray() || [];
    if (arr.length > 0) {
      return arr[arr.length - 1].tokenBonding.baseMint;
    }
  }, [pricing]);
  const basePriceInSol = usePriceInSol(lowestMint);

  const {
    loading: swapping,
    error,
    execute,
  } = useSwap({
    async extraInstructions({ tokenBonding, isBuy, amount }) {
      if (hasFees) {
        const buyingTarget =
          isBuy && tokenBonding.targetMint.equals(targetMint!);
        const sellingTarget =
          !isBuy && tokenBonding.targetMint.equals(baseMint!);
        // Only inject fees on the transaction going from the collective to a social token
        if (sellingTarget || buyingTarget) {
          let priceInSol;
          if (
            buyingTarget &&
            tokenBonding.baseMint.equals(lowestMint!) &&
            amount
          ) {
            priceInSol = toNumber(amount, baseMintInfo) * basePriceInSol!;
          } else if (amount) {
            priceInSol =
              pricing!.swap(
                // Buying target will be a buyWithBase, selling target will be a sell target amount
                toNumber(
                  amount,
                  (buyingTarget ? baseMintInfo : targetMintInfo)!
                ),
                buyingTarget ? tokenBonding.baseMint : tokenBonding.targetMint,
                lowestMint!
              ) * basePriceInSol!;
          }

          const solAmount = (priceInSol || 0) * (WUMBO_TRANSACTION_FEE / 100);
          console.log(`Taking ${solAmount} in Wum.bo fees.`);

          return {
            signers: [] as Signer[],
            instructions: [
              SystemProgram.transfer({
                fromPubkey: wallet!.adapter!.publicKey!,
                toPubkey: wumboConfig.feeWallet,
                lamports: solAmount * Math.pow(10, 9),
              }),
            ],
            output: null,
          };
        }
      }
      return {
        signers: [] as Signer[],
        instructions: [] as TransactionInstruction[],
        output: null,
      };
    },
  });

  handleErrors(error);

  const { loading: driverLoading, ...swapProps } = useSwapDriver({
    extraTransactionInfo: hasFees
      ? [
          {
            name: "Wum.bo Fee",
            tooltip:
              "A transaction fee to fund the ongoing development of Wum.bo. Only applies to purchasing social tokens, and not collective tokens",
            amount: `${WUMBO_TRANSACTION_FEE}%`,
          },
        ]
      : [],
    tradingMints: { base: baseMint, target: targetMint },
    onTradingMintsChange,
    swap: (args: ISwapArgs & { ticker: string }) =>
      execute(args).then(({ targetAmount }) => {
        history.push(
          swapConfirmationPath +
            `?amount=${targetAmount}&mint=${args.targetMint}`
        );
      }),
    onConnectWallet: () => history.push(manageWalletPath),
    tokenBondingKey: tokenBonding!,
  });

  return <SwapForm isSubmitting={swapping} {...swapProps} />;
};
