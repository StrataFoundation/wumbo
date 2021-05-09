import {Account, Keypair, PublicKey} from "@solana/web3.js";

// export const SOLANA_API_URL = "https://api.mainnet-beta.solana.com"
export const SOLANA_API_URL = "https://devnet.solana.com"
export const TWITTER_ROOT_PARENT_REGISTRY_KEY: PublicKey = new PublicKey("AFrGkxNmVLBn3mKhvfJJABvm8RJkTtRhHDoaF97pQZaA")
export const SOLCLOUT_INSTANCE_KEY: PublicKey = new PublicKey("8npFtXdjpPoR5VJKJZHCyDVzcBNsBL98gaje8yYB47EW")
export const SOLCLOUT_PROGRAM_ID: PublicKey = new PublicKey("5ZVrnbCBMoLcmuoJ2pXAS518fvjRQaLeYxpQGeffzE24")
export const TOKEN_PROGRAM_ID: PublicKey = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
const key = [243,99,226,76,228,180,49,28,35,61,133,124,225,80,78,147,2,107,58,142,6,245,23,211,113,62,255,181,222,50,4,23,51,146,66,205,166,190,240,181,45,146,254,237,136,217,114,62,55,249,200,102,79,120,51,44,187,84,64,129,102,120,70,131]
export const KEYPAIR: Keypair = Keypair.fromSecretKey(
  Uint8Array.of(...key)
)
