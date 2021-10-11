import { PublicKey } from "@solana/web3.js";
import { replaceAll } from "wumbo-common";

type Route = {
  path: string;
};

interface IRoutes {
  betaSplash: Route;
  claim: Route;
  viewProfile: Route;
  viewNft: Route;
  profile: Route;
  editProfile: Route;
  manageWallet: Route;
  wallet: Route;
  wumNetWorth: Route;
  topTokens: Route;
  sendSearch: Route;
  send: Route;
  swap: Route;
  prototype: Route;
}

export function sendPath(mint: PublicKey): string {
  return routes.send.path.replace(
    ":mint",
    mint.toBase58()
  );
}

export function topTokensPath(tokenBondingKey: PublicKey): string {
  return routes.topTokens.path.replace(
    ":tokenBondingKey",
    tokenBondingKey.toBase58()
  );
}

export function wumNetWorthPath(wallet: PublicKey): string {
  return routes.wumNetWorth.path.replace(
    ":wallet",
    wallet.toBase58()
  );
}

export const profilePath = (tokenRefKey: PublicKey): string =>
  replaceAll(routes.viewProfile.path, {
    ":tokenRefKey": tokenRefKey.toBase58(),
  });

export const nftPath = (mint: PublicKey): string =>
  replaceAll(routes.viewNft.path, { ":mint": mint.toBase58() });

export const editProfile = (ownerWalletKey: PublicKey): string =>
  replaceAll(routes.editProfile.path, {
    ":ownerWalletKey": ownerWalletKey.toBase58(),
  });

export const swapPath = (
  tokenBondingKey: PublicKey,
  action: "buy" | "sell"
): string =>
  replaceAll(routes.swap.path, {
    ":tokenBondingKey": tokenBondingKey.toBase58(),
    ":action": action,
  });

const routes: IRoutes = {
  claim: { path: "/claimSite" },
  manageWallet: { path: "/manage-wallet" },
  wallet: { path: "/wallet" },
  viewProfile: { path: "/profile/view/:tokenRefKey" },
  viewNft: { path: "/nft/view/:mint" },
  profile: { path: "/profile" },
  editProfile: { path: "/profile/edit/:ownerWalletKey" },
  betaSplash: { path: "/" },
  topTokens: { path: "/top-tokens/:tokenBondingKey" },
  wumNetWorth: { path: "/wum-net-worth/:wallet" },
  sendSearch: { path: "/send" },
  send: { path: "/send/:mint" },
  swap: { path: "/swap/:tokenBondingKey/:action" },
  prototype: { path: "/prototype" },
};

export default routes;
