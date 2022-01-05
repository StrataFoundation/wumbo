import {
  Wallet,
  getSolletExtensionWallet,
  getLedgerWallet,
  getPhantomWallet,
  getSolflareWallet,
  getTorusWallet,
} from "@solana/wallet-adapter-wallets";

export const INJECTED_PROVIDERS: Wallet[] = [
  getPhantomWallet(),
  getSolflareWallet(),
  getLedgerWallet(),
  getSolletExtensionWallet(),
];

export const WALLET_PROVIDERS: Wallet[] = [
  ...INJECTED_PROVIDERS,
  getTorusWallet({
    options: {
      replaceUrlOnRedirect: false,
      clientId:
        "BAjNy8GFgk8BzjoZPowW82MFlkOGuPVykpcANoYJTi6khZPoPnJNxvts_OViNdxXOqcvCZCo2kB-zrnEi0T-Zx4",
      network: "testnet",
      uxMode: "popup",
    },
  }),
];
