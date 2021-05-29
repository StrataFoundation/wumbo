import { Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID as SPL_TOKEN_PROGRAM_ID } from "@solana/spl-token";

// export const SOLANA_API_URL = "https://api.mainnet-beta.solana.com"
const WUM_BONDING = "6vomBNaspUfYDbkWwxR2N4xCLf6s466PchDWESrsCKvt";
const WUM_TOKEN = "bDYz78Px4d7epP62KzURwi52YNbxGXF2uiWYBgAGALK";

export const SPL_NAME_SERVICE_PROGRAM_ID = new PublicKey(
  "CiBbJADtSJnVQEsgXZpRfLyLNqDjwfvua8EMe9tPhKvo"
);
export const TOKEN_BONDING_PROGRAM_ID = new PublicKey(
  "G6ibxBmysVJtEyQJ2smdbSXSMVpTMzAWQVThpPPPdVdD"
);
export const SOLANA_API_URL = "https://devnet.solana.com";
export const SERUM_PROGRAM_ID = new PublicKey(
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
);
export const WUMBO_TO_USD_MARKET = new PublicKey(
  "6Pn1cSiRos3qhBf54uBP9ZQg8x3JTardm1dL3n4p29tA"
);
export const TWITTER_ROOT_PARENT_REGISTRY_KEY: PublicKey = new PublicKey(
  "AFrGkxNmVLBn3mKhvfJJABvm8RJkTtRhHDoaF97pQZaA"
);
export const WUMBO_INSTANCE_KEY: PublicKey = new PublicKey(
  "FcpMMj5mUhaKMUeipLB1SKY6EUYgPBnhM8a2VWs8P8g"
);
export const WUMBO_PROGRAM_ID: PublicKey = new PublicKey(
  "99VRjWhw6241SYkgv4iisLKqYUUuFY7DN3ccRnKT56Xt"
);
export const TOKEN_PROGRAM_ID: PublicKey = SPL_TOKEN_PROGRAM_ID;

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
