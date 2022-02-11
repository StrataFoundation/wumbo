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
