import { useAsyncCallback } from "react-async-hook";
import { PublicKey } from "@solana/web3.js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import BN from "bn.js";
import { usePrograms, useWallet } from "../";

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
