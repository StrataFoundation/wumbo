import { PublicKey } from "@solana/web3.js";
import { replaceAll } from "wumbo-common";

type Route = {
  path: string;
};

interface ISiteRoutes {
  root: Route;
}

interface IAppRoutes {
  root: Route;
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
  return AppRoutes.send.path.replace(":mint", mint.toBase58());
}

export function topTokensPath(tokenBondingKey: PublicKey): string {
  return AppRoutes.topTokens.path.replace(
    ":tokenBondingKey",
    tokenBondingKey.toBase58()
  );
}

export function wumNetWorthPath(wallet: PublicKey): string {
  return AppRoutes.wumNetWorth.path.replace(":wallet", wallet.toBase58());
}

export const profilePath = (tokenRefKey: PublicKey): string =>
  replaceAll(AppRoutes.viewProfile.path, {
    ":tokenRefKey": tokenRefKey.toBase58(),
  });

export const nftPath = (mint: PublicKey): string =>
  replaceAll(AppRoutes.viewNft.path, { ":mint": mint.toBase58() });

export const editProfile = (ownerWalletKey: PublicKey): string =>
  replaceAll(AppRoutes.editProfile.path, {
    ":ownerWalletKey": ownerWalletKey.toBase58(),
  });

export const swapPath = (
  tokenBondingKey: PublicKey,
  action: "buy" | "sell"
): string =>
  replaceAll(AppRoutes.swap.path, {
    ":tokenBondingKey": tokenBondingKey.toBase58(),
    ":action": action,
  });

export const SiteRoutes: ISiteRoutes = {
  root: { path: "/" },
};

export const AppRoutes: IAppRoutes = {
  root: { path: "/app" },
  claim: { path: "/app/claim" },
  manageWallet: { path: "/app/manage-wallet" },
  wallet: { path: "/app/wallet" },
  viewProfile: { path: "/app/profile/view/:tokenRefKey" },
  viewNft: { path: "/app/nft/view/:mint" },
  profile: { path: "/app/profile" },
  editProfile: { path: "/app/profile/edit/:ownerWalletKey" },
  topTokens: { path: "/app/top-tokens/:tokenBondingKey" },
  wumNetWorth: { path: "/app/wum-net-worth/:wallet" },
  sendSearch: { path: "/app/send" },
  send: { path: "/app/send/:mint" },
  swap: { path: "/app/swap/:tokenBondingKey/:action" },
  prototype: { path: "/app/prototype" },
};
