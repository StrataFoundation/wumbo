import { NATIVE_MINT } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Signer,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ISwapDriverArgs,
  Notification,
  SwapForm,
  useBondingPricing,
  useErrorHandler,
  useMint,
  useMintTokenRef,
  useSwap,
  useSwapDriver,
} from "@strata-foundation/react";
import { ISwapArgs, toNumber } from "@strata-foundation/spl-token-bonding";
import React from "react";
import toast from "react-hot-toast";
import { useHistory } from "react-router-dom";
import {
  WUMBO_TRANSACTION_FEE,
  WUMBO_TRANSACTION_FEE_DESTINATION,
} from "../constants/globals";

export const Swap = ({
  onTradingMintsChange,
  tokenBonding,
  baseMint,
  targetMint,
  manageWalletPath,
}: {
  tokenBonding?: PublicKey;
  baseMint?: PublicKey;
  targetMint?: PublicKey;
  manageWalletPath: string;
} & Pick<ISwapDriverArgs, "onTradingMintsChange">) => {
  const history = useHistory();
  const { adapter } = useWallet();
  const { handleErrors } = useErrorHandler();
  const { info: targetTokenRef, loading: loadingTarget } =
    useMintTokenRef(targetMint);
  const { info: baseTokenRef, loading: loadingBase } =
    useMintTokenRef(baseMint);
  const { pricing } = useBondingPricing(tokenBonding);
  const baseMintInfo = useMint(baseMint);
  const targetMintInfo = useMint(targetMint);

  const hasFees = targetTokenRef || baseTokenRef;
  const { loading, error, execute } = useSwap({
    async extraInstructions({ tokenBonding, isBuy, amount }) {
      if (hasFees) {
        const buyingTarget =
          isBuy && tokenBonding.targetMint.equals(targetMint!);
        const sellingTarget =
          !isBuy && tokenBonding.targetMint.equals(baseMint!);
        // Only inject fees on the transaction going from the collective to a social token
        if (sellingTarget || buyingTarget) {
          const priceInSol = pricing!.swap(
            // Buying target will be a buyWithBase, selling target will be a sell target amount
            toNumber(amount, (buyingTarget ? baseMintInfo : targetMintInfo)!),
            buyingTarget ? tokenBonding.baseMint : tokenBonding.targetMint,
            NATIVE_MINT
          );
          const solAmount = priceInSol * (WUMBO_TRANSACTION_FEE / 100);
          console.log(`Taking ${solAmount} in Wum.bo fees.`);

          return {
            signers: [] as Signer[],
            instructions: [
              SystemProgram.transfer({
                fromPubkey: adapter!.publicKey!,
                toPubkey: WUMBO_TRANSACTION_FEE_DESTINATION,
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
        toast.custom((t) => (
          <Notification
            show={t.visible}
            type="success"
            heading="Transaction Succesful"
            message={`Succesfully purchased ${Number(targetAmount).toFixed(
              9
            )} ${args.ticker}!`}
            onDismiss={() => toast.dismiss(t.id)}
          />
        ));
      }),
    onConnectWallet: () => history.push(manageWalletPath),
    tokenBondingKey: tokenBonding!,
  });

  return <SwapForm isSubmitting={loading} {...swapProps} />;
};
