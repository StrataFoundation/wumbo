import { Keypair, PublicKey } from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID as SPL_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const IS_DEV = true;
export const DEV_TWITTER_TLD = "NoahTest3";

export const TWITTER_REGISTRAR_SERVER_URL =
  "http://localhost:3000/registrar/twitter-oauth";

// export const SOLANA_API_URL = "https://api.mainnet-beta.solana.com"
export const WUM_REWARDS_PERCENTAGE = 1000;
export const WUM_BONDING = new PublicKey(
  "T8d8nTqeybQBcJgmFVEZHJebNuNEG2BvkZEQS2RuAhQ"
);
export const WUM_TOKEN = new PublicKey(
  "3y8K5ZAqJYgHbHeQr9uownFTtSLSG6MraVq38cobKRgb"
);
export const WUMBO_INSTANCE_KEY: PublicKey = new PublicKey(
  "VyCsQR6LmmW4TMazay9CS2FEJpRk92yDavqp3Saw9Pc"
);
export const WUMBO_PROGRAM_ID: PublicKey = new PublicKey(
  "AiYPQudWgXerJ1BdKfH5HkEamnPXSHAfPK2ThhKFkkDw"
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
// export const SOLANA_API_URL = "https://devnet.solana.com";
export const SOLANA_API_URL = "https://wumbo.devnet.rpcpool.com/";

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
