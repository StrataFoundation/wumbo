import { useAsync, UseAsyncReturn } from "react-async-hook";
import {
  Metadata,
  Edition,
  MasterEditionV2,
  MasterEditionV1,
  getMetadata,
  getEdition,
  decodeEdition,
  decodeMasterEdition,
  decodeMetadata,
  TokenAccount,
  MetadataKey,
  IMetadataExtension,
  useConnection,
} from "@oyster/common";
import { AccountInfo, MintInfo } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMint, useAccountFetchCache } from "@strata-foundation/react";
import {
  AccountFetchCache,
  ITokenWithMeta,
} from "@strata-foundation/spl-utils";
import {
  getArweaveMetadata,
  getDescription,
  getImage,
  getImageFromMeta,
  getMetadataKey,
  useUserTokenAccounts,
  useAssociatedAccount,
  useWallet,
} from "../../";

// TODO (BRY): Move this to metadataSdk or collectiveSdk
export function getUserTokensWithMeta(
  cache: AccountFetchCache,
  connection: Connection,
  tokenAccounts?: TokenAccount[]
): Promise<ITokenWithMetaAndAccount[]> {
  return Promise.all(
    (tokenAccounts || []).map(async ({ pubkey, info }) => {
      const metadataKey = await getMetadata(info.mint);
      const reverseTokenRefKey = await getReverseTokenRefKey(info.mint);
      const { info: tokenRef } =
        (await cache.search(
          reverseTokenRefKey,
          (pubkey, account) => ({
            pubkey,
            account,
            info: TokenRef(pubkey, account),
          }),
          true
        )) || {};

      return {
        ...(await getTokenMetadata(cache, metadataKey)),
        tokenRef,
        publicKey: pubkey,
        account: info,
      };
    })
  );
}

export function useUserTokensWithMeta(
  owner?: PublicKey
): UseAsyncReturn<ITokenWithMetaAndAccount[]> {
  const connection = useConnection();
  const { result: tokenAccounts, error } = useUserTokenAccounts(owner);
  const cache = useAccountFetchCache();

  const asyncResult = useAsync(getUserTokensWithMeta, [
    cache,
    connection,
    tokenAccounts,
  ]);
  return {
    ...asyncResult,
    error: asyncResult.error || error,
  };
}

export interface IUseTokenMetadataResult extends ITokenWithMetaAndAccount {
  loading: boolean;
  error: Error | undefined;
}
