import React from "react";
import { WumboCreator } from "../wumbo-api/state";
import {
  buyBondingWithWallet,
  sellBondingWithWallet,
} from "../wumbo-api/bindings";
import {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_BONDING_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "../constants/globals";
import { Account, Connection } from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-base";
import { PublicKey } from "@solana/web3.js";

export const buy = (wallet: WalletAdapter | undefined) => (
  connection: Connection,
  tokenBonding: PublicKey,
  amount: number,
  maxPrice: number
): Promise<void> => {
  if (wallet) {
    return buyBondingWithWallet(connection, {
      splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
      splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      splTokenProgramId: TOKEN_PROGRAM_ID,
      tokenBonding,
      purchaserWallet: wallet,
      amount: Math.floor(amount * Math.pow(10, 9)),
      maxPrice: Math.floor(maxPrice * Math.pow(10, 9))
    });
  }

  return Promise.resolve();
};

export const sell = (wallet: WalletAdapter | undefined) => (
  connection: Connection,
  tokenBonding: PublicKey,
  amount: number,
  minPrice: number
): Promise<void> => {
  if (wallet) {
    return sellBondingWithWallet(connection, {
      splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
      splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      splTokenProgramId: TOKEN_PROGRAM_ID,
      tokenBonding,
      sellerWallet: wallet,
      amount: Math.floor(amount * Math.pow(10, 9)),
      minPrice: Math.floor(minPrice * Math.pow(10, 9))
    });
  }

  return Promise.resolve();
};
