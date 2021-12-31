import {
  Wallet,
  getSolletWallet,
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
  getSolletWallet(),
  getSolletExtensionWallet(),
];

export const WALLET_PROVIDERS: Wallet[] = [
  ...INJECTED_PROVIDERS,
  getTorusWallet({
    options: {
      replaceUrlOnRedirect: false,
      clientId:
        "BHgxWcEBp7kICzfoIUlL9kCmope2NRhrDz7d8ugBucqQqBel1Q7yDvkPfLrgZh140oLxyN0MgpmziL7UG7jZuWk",
      network: "testnet",
      uxMode: "popup",
    },
  }),
];
