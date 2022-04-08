import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID as SPL_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";

export const WUMBO_TRANSACTION_FEE: number = Number(
  process.env.REACT_APP_WUMBO_TRANSACTION_FEE!
);
export const DEFAULT_COMMITMENT = "processed";
export const GET_TOKEN_ENDPOINT = process.env.REACT_APP_GET_TOKEN_ENDPOINT;
export const SITE_URL = process.env.REACT_APP_SITE_URL;
export const APP_URL = process.env.REACT_APP_APP_URL;
export const ARWEAVE_UPLOAD_URL = process.env.REACT_APP_ARWEAVE_UPLOAD_URL!;
export const STRATA_API_URL = process.env.REACT_APP_STRATA_API_URL!;
export const WUMBO_IDENTITY_SERVICE_URL =
  process.env.REACT_APP_WUMBO_IDENTITY_SERVICE_URL!;
export const NFT_VERIFIER_URL = process.env.REACT_APP_NFT_VERIFIER_URL;

export const TROPHY_CREATOR = new PublicKey(
  process.env.REACT_APP_TROPHY_CREATOR!
);

// export const SOLANA_API_URL = "https://api.mainnet-beta.solana.com"
export const OPEN_BONDING = SplTokenCollective.OPEN_COLLECTIVE_BONDING_ID;
export const OPEN_TOKEN = SplTokenCollective.OPEN_COLLECTIVE_MINT_ID;

export const SOL_TOKEN = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const SPL_NAME_SERVICE_PROGRAM_ID = new PublicKey(
  "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX"
);

// export const SOLANA_API_URL = "https://api.devnet.solana.com";
export const SOLANA_API_URL = process.env.REACT_APP_SOLANA_API_URL!;

export const SERUM_PROGRAM_ID = new PublicKey(
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
);
export const SOL_TO_USD_MARKET = new PublicKey(
  "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT"
);
export const TWITTER_ROOT_PARENT_REGISTRY_KEY: PublicKey = new PublicKey(
  "AFrGkxNmVLBn3mKhvfJJABvm8RJkTtRhHDoaF97pQZaA"
);
export const TOKEN_PROGRAM_ID: PublicKey = SPL_TOKEN_PROGRAM_ID;

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export const AR_SOL_HOLDER_ID = new PublicKey(
  "HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm"
);

export const BASE_SLIPPAGE = Number(process.env.REACT_APP_BASE_SLIPPAGE!);
