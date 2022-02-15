import { PublicKey } from "@solana/web3.js";
import { fetchConfig } from "@/contexts";

let twitterTld: PublicKey, twitterVerifier: PublicKey;
export async function getTwitterTld(): Promise<PublicKey> {
  if (!twitterTld) {
    const config = await fetchConfig();
    twitterTld = new PublicKey(config.tlds.twitter);
  }

  return twitterTld;
}

export async function getTwitterVerifier(): Promise<PublicKey> {
  if (!twitterVerifier) {
    const config = await fetchConfig();
    twitterVerifier = new PublicKey(config.verifiers.twitter);
  }

  return twitterVerifier;
}
