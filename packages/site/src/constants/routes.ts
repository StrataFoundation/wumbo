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

export const profilePath = (mint: PublicKey): string =>
  replaceAll(AppRoutes.viewProfile.path, {
    ":mint": mint.toBase58(),
  });

export const nftPath = (mint: PublicKey): string =>
  replaceAll(AppRoutes.viewNft.path, { ":mint": mint.toBase58() });

export const swapPath = (
  tokenBondingKey: PublicKey,
  baseMint: PublicKey,
  targetMint: PublicKey
): string =>
  replaceAll(AppRoutes.swap.path, {
    ":tokenBondingKey": tokenBondingKey.toBase58(),
    ":baseMint": baseMint.toBase58(),
    ":targetMint": targetMint.toBase58(),
  });

export const SiteRoutes: ISiteRoutes = {
  root: { path: "/" },
};

export const claimPath = ({
  step,
  authCode,
  handle,
}: {
  step: number;
  authCode?: string | null | undefined;
  handle: string;
}): string => {
  let path = `${AppRoutes.claim.path}?step=${step}&handle=${handle}`;

  if (authCode) {
    path = `${path}&authCode=${authCode}`;
  }

  return path;
};

export const AppRoutes: IAppRoutes = {
  root: { path: "/app" },
  claim: { path: "/app/claim" },
  manageWallet: { path: "/app/manage-wallet" },
  wallet: { path: "/app/wallet" },
  viewProfile: { path: "/app/profile/view/:mint" },
  viewNft: { path: "/app/nft/view/:mint" },
  profile: { path: "/app/profile" },
  editProfile: { path: "/app/profile/edit" },
  topTokens: { path: "/app/top-tokens/:tokenBondingKey" },
  wumNetWorth: { path: "/app/wum-net-worth/:wallet" },
  sendSearch: { path: "/app/send" },
  send: { path: "/app/send/:mint" },
  swap: { path: "/app/swap/:tokenBondingKey/:baseMint/:targetMint" },
  prototype: { path: "/app/prototype" },
};
