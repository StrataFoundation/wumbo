import { PublicKey } from "@solana/web3.js";
import { replaceAll, toQueryString } from "wumbo-common";

type Route = {
  path: string;
};

interface IRoutes {
  root: Route;
  claim: Route;
  optOut: Route;
  claimedOptOut: Route;
  viewProfile: Route;
  viewNft: Route;
  viewBounty: Route;
  editBounty: Route;
  createBounty: Route;
  profile: Route;
  editProfile: Route;
  manageWallet: Route;
  wallet: Route;
  wumNetWorth: Route;
  topTokens: Route;
  sendSearch: Route;
  send: Route;
  swap: Route;
  swapConfirmation: Route;
  prototype: Route;
  burnBeta: Route;
  relink: Route;
}

export const Routes: IRoutes = {
  root: { path: "/" },
  relink: { path: "/relink" },
  claim: { path: "/claim" },
  optOut: { path: "/opt-out" },
  claimedOptOut: { path: "/claimed-opt-out" },
  manageWallet: { path: "/manage-wallet" },
  wallet: { path: "/my-tokens" },
  viewProfile: { path: "/profile/view/:mint" },
  viewNft: { path: "/nft/view/:mint" },
  profile: { path: "/profile" },
  editProfile: { path: "/profile/edit" },
  topTokens: { path: "/top-tokens/:tokenBondingKey" },
  wumNetWorth: { path: "/wum-net-worth/:wallet" },
  sendSearch: { path: "/send" },
  send: { path: "/send/:mint" },
  swap: { path: "/swap/:tokenBondingKey/:baseMint/:targetMint" },
  swapConfirmation: { path: "/swap/confirmation" },
  prototype: { path: "/prototype" },
  burnBeta: { path: "/burn-beta" },
  viewBounty: { path: "/bounty/view/:mint" },
  createBounty: { path: "/bounty/new/:mint" },
  editBounty: { path: "/bounty/:mint/edit" },
};

export const editBountyPath = (mintKey: PublicKey): string =>
  replaceAll(Routes.editBounty.path, {
    ":mint": mintKey.toBase58(),
  });

export const createBountyPath = (mintKey: PublicKey): string =>
  replaceAll(Routes.createBounty.path, {
    ":mint": mintKey.toBase58(),
  });

export const bountyPath = (mint: PublicKey): string =>
  replaceAll(Routes.viewBounty.path, {
    ":mint": mint.toBase58(),
  });

export const sendPath = (mint: PublicKey, recipient?: PublicKey): string =>
  Routes.send.path.replace(":mint", mint.toBase58()) +
  (recipient ? `?recipient=${recipient}` : "");

export const sendSearchPath = (recipient?: PublicKey): string =>
  Routes.sendSearch.path + (recipient ? `?recipient=${recipient}` : "");

export const topTokensPath = (tokenBondingKey: PublicKey): string =>
  Routes.topTokens.path.replace(":tokenBondingKey", tokenBondingKey.toBase58());

export const wumNetWorthPath = (wallet: PublicKey): string =>
  Routes.wumNetWorth.path.replace(":wallet", wallet.toBase58());

export const profilePath = (mint: PublicKey): string =>
  replaceAll(Routes.viewProfile.path, {
    ":mint": mint.toBase58(),
  });

export const nftPath = (mint: PublicKey): string =>
  replaceAll(Routes.viewNft.path, { ":mint": mint.toBase58() });

export const swapPath = (
  tokenBondingKey: PublicKey,
  baseMint: PublicKey,
  targetMint: PublicKey
): string =>
  replaceAll(Routes.swap.path, {
    ":tokenBondingKey": tokenBondingKey.toBase58(),
    ":baseMint": baseMint.toBase58(),
    ":targetMint": targetMint.toBase58(),
  });

export const claimPath = (args: {
  step: string;
  handle: string;
  code?: string;
}): string => `${Routes.claim.path}?${toQueryString(args)}`;

export const optOutPath = (args: {
  handle: string;
  fiatLocked: number;
  claimableAmount: number;
}): string => `${Routes.optOut.path}?${toQueryString(args)}`;
