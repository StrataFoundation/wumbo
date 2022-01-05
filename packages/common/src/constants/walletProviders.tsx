import { Adapter } from "@solana/wallet-adapter-base";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

export const INJECTED_PROVIDERS: Adapter[] = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new SlopeWalletAdapter(),
  new LedgerWalletAdapter(),
  new SolletWalletAdapter(),
  new SolletExtensionWalletAdapter(),
];

export const WALLET_PROVIDERS: Adapter[] = [
  ...INJECTED_PROVIDERS,
  new TorusWalletAdapter(),
];
