import {SolongWalletAdapter} from "@oyster/common/lib/wallet-adapters/solong";
import {PhantomWalletAdapter} from "@oyster/common/lib/wallet-adapters/phantom";
import {LedgerWalletAdapter} from "@solana/wallet-ledger";
import {MathWalletAdapter} from "@oyster/common/lib/wallet-adapters/mathWallet";
// @ts-ignore
import SolletAdapter from "@project-serum/sol-wallet-adapter";
import {WalletProvider} from "@solana/wallet-base";

const ASSETS_URL =
  "https://raw.githubusercontent.com/solana-labs/oyster/main/assets/wallets/";

export const WALLET_PROVIDERS: WalletProvider[] = [
  {
    name: "Phantom",
    url: "https://www.phantom.app",
    icon: `https://www.phantom.app/img/logo.png`,
    adapter: PhantomWalletAdapter,
  },
  {
    name: "Ledger",
    url: "https://www.ledger.com",
    icon: `${ASSETS_URL}ledger.svg`,
    adapter: LedgerWalletAdapter,
  },
  {
    name: "Sollet",
    url: "https://www.sollet.io",
    icon: `${ASSETS_URL}sollet.svg`,
    adapter: SolletAdapter,
  },
  {
    name: "Solong",
    url: "https://solongwallet.com",
    icon: `${ASSETS_URL}solong.png`,
    adapter: SolongWalletAdapter,
  },
  // TODO: enable when fully functional
  {
    name: "MathWallet",
    url: "https://mathwallet.org",
    icon: `${ASSETS_URL}mathwallet.svg`,
    adapter: MathWalletAdapter,
  },
  // {
  //   name: 'Torus',
  //   url: 'https://tor.us',
  //   icon: `${ASSETS_URL}torus.svg`,
  //   adapter: TorusWalletAdapter,
  // }

  // Solflare doesnt allow external connections for all apps
  // {
  //   name: "Solflare",
  //   url: "https://solflare.com/access-wallet",
  //   icon: `${ASSETS_URL}solflare.svg`,
  // },
];
