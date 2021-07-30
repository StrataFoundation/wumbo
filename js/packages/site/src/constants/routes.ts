import { PublicKey } from "@solana/web3.js";

type Route = {
  path: string;
};

interface IRoutes {
  betaSplash: Route;
  claim: Route;
  viewProfile: Route;
  profile: Route;
  editProfile: Route;
  wallet: Route;
}

export function profilePath(tokenBondingKey: PublicKey): string {
  return routes.viewProfile.path.replace(":tokenBondingKey", tokenBondingKey.toBase58());
}

export function editProfile(ownerWalletKey: PublicKey): string {
  return routes.editProfile.path.replace(":ownerWalletKey", ownerWalletKey.toBase58());
}

const routes: IRoutes = {
  claim: { path: "/claim" },
  wallet: { path: "/wallet" },
  viewProfile: { path: "/profile/view/:tokenBondingKey" },
  profile: { path: "/profile" },
  editProfile: { path: "/profile/edit/:ownerWalletKey" },
  betaSplash: { path: "/" },
};

export default routes;
