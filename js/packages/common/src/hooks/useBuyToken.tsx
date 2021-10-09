import { useAsyncCallback } from "react-async-hook";
import { PublicKey } from "@solana/web3.js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import BN from "bn.js";
import { usePrograms, useWallet } from "../";

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
