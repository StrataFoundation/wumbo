import {
  Wallet,
  getSolletWallet,
  getLedgerWallet,
  getPhantomWallet,
  getSolflareWallet,
  getTorusWallet,
  getSolongWallet,
} from "@solana/wallet-adapter-wallets";

export const INJECTED_PROVIDERS: Wallet[] = [
  getPhantomWallet(),
  getLedgerWallet(),
  getSolletWallet(),
  getSolflareWallet(),
  getSolongWallet(),
];

export const WALLET_PROVIDERS: Wallet[] = [
  ...INJECTED_PROVIDERS,
  getTorusWallet({
    options: {
      clientId:
        "BHgxWcEBp7kICzfoIUlL9kCmope2NRhrDz7d8ugBucqQqBel1Q7yDvkPfLrgZh140oLxyN0MgpmziL7UG7jZuWk",
      network: "testnet",
      uxMode: "popup",
    },
  }),
];
