import {
  Wallet,
  getSolletWallet,
  getLedgerWallet,
  getPhantomWallet,
  getTorusWallet,
} from "@solana/wallet-adapter-wallets";

export const WALLET_PROVIDERS: Wallet[] = [
  getSolletWallet(),
  getLedgerWallet(),
  getPhantomWallet(),
  // TODO: get Torus clientId
  getTorusWallet({ clientId: "" }),
];
