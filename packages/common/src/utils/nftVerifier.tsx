import {
  getNameAccountKey,
  getHashedName,
  NameRegistryState,
} from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { deserializeUnchecked } from "borsh";
import { useTokenMetadata } from "@strata-foundation/react";
import {
  AccountFetchCache,
  decodeMetadata,
} from "@strata-foundation/spl-utils";
import { NFT_VERIFIER, NFT_VERIFIER_TLD } from "../constants/globals";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";

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
    metadataKey &&
    (await cache.search(
      metadataKey,
      (pubkey, account) => ({
        pubkey,
        account,
        info: decodeMetadata(account.data),
      }),
      true
    ));
  const mintKey = metadata?.info && new PublicKey(metadata.info.mint);

  return Promise.resolve(mintKey);
}
