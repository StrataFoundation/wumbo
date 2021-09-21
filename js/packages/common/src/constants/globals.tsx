import { Keypair, PublicKey } from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID as SPL_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const DEFAULT_COMMITMENT = "processed";
export const IS_DEV = true;
export const DEV_TWITTER_TLD = "WumboDevTwitter1";
const key = [243,99,226,76,228,180,49,28,35,61,133,124,225,80,78,147,2,107,58,142,6,245,23,211,113,62,255,181,222,50,4,23,51,146,66,205,166,190,240,181,45,146,254,237,136,217,114,62,55,249,200,102,79,120,51,44,187,84,64,129,102,120,70,131]
export const DEV_TWITTER_VERIFIER: Keypair = Keypair.fromSecretKey(
  Uint8Array.of(...key)
)

export const WUMBO_API_URL = "https://dev-api.teamwumbo.com/graphql"
export const NFT_VERIFIER_URL = "https://dev-nft-verifier.teamwumbo.com"

export const NFT_VERIFIER_TLD = new PublicKey("12UFqXT52JUuArrHy8FPqVtzBVF2pkB8H4C9HVMAJRU6");

export const NFT_VERIFIER = new PublicKey("3ADxhmXXXxWz6jT949DDw9r7E6uz6Vk1bssUHSNBcrbE");

export const TROPHY_CREATOR = new PublicKey("3ADxhmXXXxWz6jT949DDw9r7E6uz6Vk1bssUHSNBcrbE")

export const TWITTER_REGISTRAR_SERVER_URL =
  "http://localhost:3000/registrar/twitter-oauth";

// export const SOLANA_API_URL = "https://api.mainnet-beta.solana.com"
export const WUM_REWARDS_PERCENTAGE = 1000;
export const WUM_BONDING = new PublicKey(
  "CxC914cLPQcaAqPHAXgDwGmadUJdcfoCZPbzRdvqfjgH"
);
export const WUM_TOKEN = new PublicKey(
  "APrp3XGnpzia6TiRibgejspu53DamtcubbQZ94baV6Ak"
);
export const WUMBO_INSTANCE_KEY: PublicKey = new PublicKey(
  "7HdQHwbySEjFKcZNCJ6Vdmhp8Acjf48UpRNJu5mRvr4c"
);

export const SOL_TOKEN = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const SPL_NAME_SERVICE_PROGRAM_ID = new PublicKey(
  "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX"
);
export const TOKEN_BONDING_PROGRAM_ID = new PublicKey(
  "4K8fnycnTESeyad4DqfXPF8TbkuyscPK4EjAwY35emyW"
);
// export const SOLANA_API_URL = "https://api.devnet.solana.com";
export const SOLANA_API_URL = "https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/";

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

export const BASE_SLIPPAGE = 0.1;
