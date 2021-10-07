import { PublicKey } from "@solana/web3.js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { usePrograms, useWallet } from "wumbo-common";
import BN from "bn.js";
import { useAsyncCallback } from "react-async-hook";

export const useBuy = (): [
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

export const useSell = (): [
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
