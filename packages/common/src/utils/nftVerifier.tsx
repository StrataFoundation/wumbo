import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { AccountFetchCache } from "@strata-foundation/spl-utils";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { deserializeUnchecked } from "borsh";

export async function getNftNameRecordKey(
  imgUrl: string,
  verifier: PublicKey,
  tld: PublicKey
): Promise<PublicKey> {
  return getNameAccountKey(await getHashedName(imgUrl), verifier, tld);
}

export async function getNftMetadataKey(
  cache: AccountFetchCache,
  imgUrl: string,
  verifier: PublicKey,
  tld: PublicKey
): Promise<PublicKey | undefined> {
  const [header, dispose] = await cache.searchAndWatch(
    await getNftNameRecordKey(imgUrl, verifier, tld),
    (pubkey, account) => {
      const header: NameRegistryState = deserializeUnchecked(
        NameRegistryState.schema,
        NameRegistryState,
        account.data
      );
      return {
        pubkey,
        account,
        info: header,
      };
    },
    true
  );
  // Keep cached for 2 seconds since nft fetcher runs every 1s
  setTimeout(dispose, 2 * 1000);

  const tokenMetadata =
    header &&
    new PublicKey(
      header.account.data.slice(
        NameRegistryState.HEADER_LEN,
        NameRegistryState.HEADER_LEN + 32
      )
    );

  return tokenMetadata;
}

export async function getNftMint(
  cache: AccountFetchCache,
  imgUrl: string,
  verifier: PublicKey,
  tld: PublicKey
): Promise<PublicKey | undefined> {
  const metadataKey = await getNftMetadataKey(cache, imgUrl, verifier, tld);
  const metadata =
    metadataKey &&
    (await cache.search(
      metadataKey,
      (pubkey, account) => ({
        pubkey,
        account,
        info: new Metadata(pubkey, account).data,
      }),
      true
    ));
  const mintKey = metadata?.info && new PublicKey(metadata.info.mint);

  return Promise.resolve(mintKey);
}
