import { WalletAdapter, WalletError } from "@solana/wallet-adapter-base";
import { Wallet, WalletName } from "@solana/wallet-adapter-wallets";
import { PublicKey, Transaction } from "@solana/web3.js";
import { createContext, useContext } from "react";

export interface WalletContextState {
  wallet: Wallet | undefined;
  walletAdapter: WalletAdapter | undefined;
  select: (walletName: WalletName) => void;

  publicKey: PublicKey | null;
  ready: boolean;
  connecting: boolean;
  disconnecting: boolean;
  connected: boolean;
  autoApprove: boolean;
  awaitingApproval: boolean;
  error: WalletError | undefined;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>;
}

export const WalletContext = createContext<WalletContextState>({} as WalletContextState);

export function useWallet(): WalletContextState {
  return useContext(WalletContext);
}
