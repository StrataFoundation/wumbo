import { ReactNode } from "react";
import {
  SwitchVerticalIcon,
  SearchIcon,
  DatabaseIcon,
  CashIcon,
  UserIcon,
} from "@heroicons/react/outline";
import { PublicKey } from "@solana/web3.js";

type Route = {
  path: string;
  Icon: ReactNode | null;
  isDrawerNav: boolean;
};

export interface IRoutes {
  create: Route;
  claim: Route;
  customize: Route;
  trade: Route;
  myCoins: Route;
  wallet: Route;
  search: Route;
  profile: Route;
  editProfile: Route;
  viewProfile: Route;
  viewNft: Route;
}

export function viewProfilePath(tokenRefKey: PublicKey): string {
  return routes.viewProfile.path.replace(":tokenRefKey", tokenRefKey.toBase58());
}

export function nftPath(mint: PublicKey): string {
  return routes.viewNft.path.replace(":mint", mint.toBase58());
}

export function tradePath(tokenBondingKey: PublicKey): string {
  return routes.trade.path.replace(":tokenBondingKey", tokenBondingKey.toBase58());
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
  trade: {
    path: "/trade/:tokenBondingKey",
    Icon: SwitchVerticalIcon,
    isDrawerNav: true,
  },
  myCoins: { path: "/mycoins", Icon: DatabaseIcon, isDrawerNav: true },
  wallet: { path: "/wallet", Icon: CashIcon, isDrawerNav: true },
  search: { path: "/search", Icon: SearchIcon, isDrawerNav: true },
  profile: { path: "/profile", Icon: UserIcon, isDrawerNav: true },
  editProfile: { path: "/profile/edit", Icon: UserIcon, isDrawerNav: false },
  viewProfile: { path: "/profile/view/:tokenRefKey", Icon: UserIcon, isDrawerNav: false },
  viewNft: { path: "/nft/view/:mint", Icon: UserIcon, isDrawerNav: false },
};

export const paths: string[] = Object.keys(routes).map(
  (route) => routes[route as keyof IRoutes].path
);
