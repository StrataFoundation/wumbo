import { ReactNode } from "react";
import { RiUserLine, RiCoinLine, RiArrowUpDownFill } from "react-icons/ri";
import { PublicKey } from "@solana/web3.js";
import { replaceAll } from "wumbo-common";

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
  swap: Route;
  myTokens: Route;
  manageWallet: Route;
  profile: Route;
  editProfile: Route;
  viewProfile: Route;
  topTokens: Route;
  wumNetWorth: Route;
  viewNft: Route;
  tagNft: Route;
  sendSearch: Route;
  send: Route;
}

export function sendPath(mint: PublicKey): string {
  return routes.send.path.replace(":mint", mint.toBase58());
}

export const viewProfilePath = (tokenRefKey: PublicKey): string =>
  replaceAll(routes.viewProfile.path, {
    ":tokenRefKey": tokenRefKey.toBase58(),
  });

export const nftPath = (mint: PublicKey): string =>
  replaceAll(routes.viewNft.path, {
    ":mint": mint.toBase58(),
  });

export function topTokensPath(tokenBondingKey: PublicKey): string {
  return routes.topTokens.path.replace(
    ":tokenBondingKey",
    tokenBondingKey.toBase58()
  );
}

export function wumNetWorthPath(wallet: PublicKey): string {
  return routes.wumNetWorth.path.replace(":wallet", wallet.toBase58());
}

export const tagNftPath = (mint: PublicKey): string =>
  replaceAll(routes.tagNft.path, { ":mint": mint.toBase58() });

export const swapPath = (
  tokenBondingKey: PublicKey,
  baseMint: PublicKey,
  targetMint: PublicKey
): string =>
  replaceAll(routes.swap.path, {
    ":tokenBondingKey": tokenBondingKey.toBase58(),
    ":baseMint": baseMint.toBase58(),
    ":targetMint": targetMint.toBase58()
  });

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
  profile: {
    path: "/profile",
    Icon: RiUserLine,
    isDrawerNav: true,
    exact: true,
  },
  myTokens: { path: "/my-tokens", Icon: RiCoinLine, isDrawerNav: true },
  manageWallet: { path: "/manage-wallet", Icon: null, isDrawerNav: false },
  swap: {
    path: "/swap/:tokenBondingKey/:baseMint/:targetMint",
    Icon: RiArrowUpDownFill,
    isDrawerNav: true,
  },
  editProfile: { path: "/profile/edit", Icon: null, isDrawerNav: false },
  viewProfile: {
    path: "/profile/view/:tokenRefKey",
    Icon: null,
    isDrawerNav: false,
  },
  topTokens: {
    path: "/top-tokens/:tokenBondingKey",
    Icon: null,
    isDrawerNav: false,
  },
  wumNetWorth: {
    path: "/wum-net-worth/:wallet",
    Icon: null,
    isDrawerNav: false,
  },
  viewNft: { path: "/nft/view/:mint", Icon: null, isDrawerNav: false },
  tagNft: { path: "/nft/tag/:mint", Icon: null, isDrawerNav: false },
  sendSearch: { path: "/send", Icon: null, isDrawerNav: false },
  send: { path: "/send/:mint", Icon: null, isDrawerNav: false },
};

export const paths: string[] = Object.keys(routes).map(
  (route) => routes[route as keyof IRoutes].path
);
