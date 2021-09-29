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
  prototype: Route;
}

export function profilePath(tokenRefKey: PublicKey): string {
  return routes.viewProfile.path.replace(
    ":tokenRefKey",
    tokenRefKey.toBase58()
  );
}

export function nftPath(mint: PublicKey): string {
  return routes.viewNft.path.replace(":mint", mint.toBase58());
}

export function editProfile(ownerWalletKey: PublicKey): string {
  return routes.editProfile.path.replace(
    ":ownerWalletKey",
    ownerWalletKey.toBase58()
  );
}

const routes: IRoutes = {
  claim: { path: "/claimSite" },
  manageWallet: { path: "/manage-wallet" },
  wallet: { path: "/wallet" },
  viewProfile: { path: "/profile/view/:tokenRefKey" },
  viewNft: { path: "/nft/view/:mint" },
  profile: { path: "/profile" },
  editProfile: { path: "/profile/edit/:ownerWalletKey" },
  betaSplash: { path: "/" },
  prototype: { path: "/prototype" },
};

export default routes;
