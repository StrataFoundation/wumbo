import React, { useState, useCallback } from "react";
import { PublicKey, Transaction, sendAndConfirmRawTransaction } from "@solana/web3.js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  useConnection,
  usePrograms,
  useWallet,
} from "wumbo-common";
import BN from "bn.js";
import { useAsyncCallback } from "react-async-hook";

export const useBuy = (): [
  (tokenBonding: PublicKey, amount: number, maxPrice: number) => Promise<string>,
  { data: any; loading: boolean; error: Error | undefined }
] => {
  const connection = useConnection();
  const { connected, signTransaction, publicKey } = useWallet();
  const { splTokenBondingProgram } = usePrograms();

  const { result: data, execute: buy, error, loading } = useAsyncCallback(
    async (tokenBonding, amount, slippage) => {
      if (!connected || !publicKey) throw new WalletNotConnectedError();

      const { instructions, signers } = await splTokenBondingProgram!.buyV0Instructions({
        tokenBonding,
        desiredTargetAmount: new BN(Math.floor(amount * Math.pow(10, 9))),
        slippage
      });

      const transaction = new Transaction({
        feePayer: publicKey,
        recentBlockhash: (await connection.getRecentBlockhash('confirmed')).blockhash,
      });
      transaction.add(...instructions)
      signers.length > 0 && transaction.partialSign(...signers)
      const signed = await signTransaction(transaction);
      const data = await sendAndConfirmRawTransaction(connection, signed.serialize(), { commitment: 'confirmed', preflightCommitment: 'confirmed' });
      return data;
    }
  );

  return [buy, { data, loading, error }];
};

export const useSell = (): [
  (tokenBonding: PublicKey, amount: number, minPrice: number) => Promise<string>,
  { data: any; loading: boolean; error: Error | undefined }
] => {
  const connection = useConnection();
  const { connected, publicKey, signTransaction } = useWallet();
  const { splTokenBondingProgram } = usePrograms();
  const { result, loading, execute: sell, error } = useAsyncCallback(
    async (tokenBonding, amount, slippage) => {
      if (!connected || !publicKey) throw new WalletNotConnectedError();

      const { instructions, signers } = await splTokenBondingProgram!.sellV0Instructions({
        tokenBonding,
        targetAmount: new BN(Math.floor(amount * Math.pow(10, 9))),
        slippage
      });

      const transaction = new Transaction({
        feePayer: publicKey,
        recentBlockhash: (await connection.getRecentBlockhash('confirmed')).blockhash,
      });

      transaction.add(...instructions);
      signers.length > 0 && transaction.partialSign(...signers)

      const signed = await signTransaction(transaction);
      const data = await sendAndConfirmRawTransaction(connection, signed.serialize(), { commitment: 'confirmed', preflightCommitment: 'confirmed' });
      return data;
    }
  );

  return [sell, { data: result, loading, error }];
};
