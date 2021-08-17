import React, { useState, useCallback } from "react";
import { useConnection } from "@oyster/common";
import { buyBondingInstructions, sellBondingInstructions } from "@wum.bo/spl-token-bonding";
import { PublicKey, Transaction, sendAndConfirmRawTransaction } from "@solana/web3.js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_BONDING_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  useWallet,
} from "wumbo-common";

export const useBuy = (): [
  (tokenBonding: PublicKey, amount: number, maxPrice: number) => Promise<void>,
  { data: any; loading: boolean; error: Error | undefined }
] => {
  const connection = useConnection();
  const { connected, publicKey, signTransaction } = useWallet();
  // TODO fix data type;
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  const buy = useCallback(
    async (tokenBonding, amount, maxPrice) => {
      if (!connected || !publicKey) throw new WalletNotConnectedError();
      setLoading(true);

      try {
        const instructions = await buyBondingInstructions(connection, {
          splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
          splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
          splTokenProgramId: TOKEN_PROGRAM_ID,
          tokenBonding,
          purchaser: publicKey,
          amount: Math.floor(amount * Math.pow(10, 9)),
          maxPrice: Math.floor(maxPrice * Math.pow(10, 9)),
        });

        const transaction = new Transaction({
          feePayer: publicKey,
          recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        });

        transaction.instructions = instructions;
        const signed = await signTransaction(transaction);
        const data = await sendAndConfirmRawTransaction(connection, signed.serialize());
        setData(data);
      } finally {
        setLoading(false);
      }
    },
    [connected, publicKey, setLoading, setError]
  );

  return [buy, { data, loading, error }];
};

export const useSell = (): [
  (tokenBonding: PublicKey, amount: number, minPrice: number) => Promise<void>,
  { data: any; loading: boolean; error: Error | undefined }
] => {
  const connection = useConnection();
  const { connected, publicKey, signTransaction } = useWallet();
  // TODO fix data type;
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  const sell = useCallback(
    async (tokenBonding, amount, minPrice) => {
      if (!connected || !publicKey) throw new WalletNotConnectedError();
      setLoading(true);

      try {
        const instructions = await sellBondingInstructions(connection, {
          splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
          splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
          splTokenProgramId: TOKEN_PROGRAM_ID,
          tokenBonding,
          seller: publicKey,
          amount: Math.floor(amount * Math.pow(10, 9)),
          minPrice: Math.floor(minPrice * Math.pow(10, 9)),
        });

        const transaction = new Transaction({
          feePayer: publicKey,
          recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        });

        transaction.instructions = instructions;
        const signed = await signTransaction(transaction);
        const data = await sendAndConfirmRawTransaction(connection, signed.serialize());
        setData(data);
      } finally {
        setLoading(false);
      }
    },
    [connected, publicKey, setLoading, setError]
  );

  return [sell, { data, loading, error }];
};
