import { ReactNode } from "react";
import { RiUserLine, RiWallet3Line, RiExchangeLine } from "react-icons/ri";
import { PublicKey } from "@solana/web3.js";

type Route = {
  path: string;
  Icon: ReactNode | null;
  isDrawerNav: boolean;
  exact?: boolean;
};

export interface IRoutes {
  create: Route;
  claim: Route;
  customize: Route;
  trade: Route;
  wallet: Route;
  manageWallet: Route;
  profile: Route;
  editProfile: Route;
  viewProfile: Route;
  viewNft: Route;
  tagNft: Route;
}

export function viewProfilePath(tokenRefKey: PublicKey): string {
  return routes.viewProfile.path.replace(
    ":tokenRefKey",
    tokenRefKey.toBase58()
  );
}

export function nftPath(mint: PublicKey): string {
  return routes.viewNft.path.replace(":mint", mint.toBase58());
}

export function tagNftPath(mint: PublicKey): string {
  return routes.tagNft.path.replace(":mint", mint.toBase58());
}

export function tradePath(tokenBondingKey: PublicKey): string {
  return routes.trade.path.replace(
    ":tokenBondingKey",
    tokenBondingKey.toBase58()
  );
}

export function claimPath({
  code,
  name,
  redirectUri,
}: {
  code: string | undefined;
  name: string | undefined;
  redirectUri: string | undefined;
}): string {
  return `${routes.claim.path}?name=${name}&code=${code}&redirectUri=${redirectUri}`;
}

export const routes: IRoutes = {
  create: { path: "/create", Icon: null, isDrawerNav: false },
  claim: { path: "/claim", Icon: null, isDrawerNav: false },
  customize: { path: "/customize", Icon: null, isDrawerNav: false },
  profile: { path: "/profile", Icon: RiUserLine, isDrawerNav: true, exact: true },
  wallet: { path: "/wallet", Icon: RiWallet3Line, isDrawerNav: true },
  manageWallet: { path: "/manage-wallet", Icon: null, isDrawerNav: false },
  trade: {
    path: "/trade/:tokenBondingKey",
    Icon: RiExchangeLine,
    isDrawerNav: true,
  },
  editProfile: { path: "/profile/edit", Icon: null, isDrawerNav: false },
  viewProfile: {
    path: "/profile/view/:tokenRefKey",
    Icon: null,
    isDrawerNav: false,
  },
  viewNft: { path: "/nft/view/:mint", Icon: null, isDrawerNav: false },
  tagNft: { path: "/nft/tag/:mint", Icon: null, isDrawerNav: false },
};

export const paths: string[] = Object.keys(routes).map(
  (route) => routes[route as keyof IRoutes].path
);
