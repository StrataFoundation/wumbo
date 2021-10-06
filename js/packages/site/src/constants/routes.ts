import { PublicKey } from "@solana/web3.js";

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
  swap: Route;
  prototype: Route;
}

const replaceAll = (str: string, mapObj: Record<string, string>) => {
  const re = new RegExp(Object.keys(mapObj).join("|"), "gi");

  return str.replace(re, (matched: string) => mapObj[matched.toLowerCase()]);
};

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
  tokenBonding: PublicKey,
  action: "buy" | "sell"
): string =>
  replaceAll(routes.swap.path, {
    ":tokenBonding": tokenBonding.toBase58(),
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
  swap: { path: "/swap/:tokenBonding/:action" },
  prototype: { path: "/prototype" },
};

export default routes;
