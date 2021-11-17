import {
  getNameAccountKey,
  getHashedName,
  NameRegistryState,
} from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { deserializeUnchecked } from "borsh";
import { AccountFetchCache } from "@strata-foundation/spl-utils";
import { NFT_VERIFIER, NFT_VERIFIER_TLD } from "../constants/globals";
import { MetadataParser } from "./metaplex";

export async function getNftNameRecordKey(imgUrl: string): Promise<PublicKey> {
  return getNameAccountKey(
    await getHashedName(imgUrl),
    NFT_VERIFIER,
    NFT_VERIFIER_TLD
  );
}

export async function getNftMetadataKey(
  cache: AccountFetchCache,
  imgUrl: string
): Promise<PublicKey | undefined> {
  const header = await cache.searchAndWatch(
    await getNftNameRecordKey(imgUrl),
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
  imgUrl: string
): Promise<PublicKey | undefined> {
  const metadataKey = await getNftMetadataKey(cache, imgUrl);
  const metadata =
    metadataKey && (await cache.searchAndWatch(metadataKey, MetadataParser));

  return metadata?.info?.mint;
}
