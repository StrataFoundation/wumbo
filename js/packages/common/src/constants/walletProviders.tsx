import {
  Wallet,
  getSolletWallet,
  getLedgerWallet,
  getPhantomWallet,
  getSolflareWallet,
} from "@solana/wallet-adapter-wallets";

export const INJECTED_PROVIDERS: Wallet[] = [
  getPhantomWallet(),
  getLedgerWallet(),
  getSolletWallet(),
  getSolflareWallet(),
];

export const WALLET_PROVIDERS: Wallet[] = [...INJECTED_PROVIDERS];
