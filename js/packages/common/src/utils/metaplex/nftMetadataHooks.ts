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
} from "@oyster/common";
import { useConnection } from "../../contexts/connection";
import { AccountInfo } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useAsync, UseAsyncReturn } from "react-async-hook";
import { useAssociatedAccount } from "..";
import { useWallet } from "../../contexts";
import {
  useAccount,
  useAccountFetchCache,
  useUserTokenAccounts,
} from "../account";
import {
  AccountFetchCache,
  AccountParser,
} from "../accountFetchCache/accountFetchCache";
import {
  getArweaveMetadata,
  getDescription,
  getImage,
  getMetadataKey,
} from "./utils";
import { getReverseTokenRefKey, getTokenRefKeyFromOwner, useClaimedTokenRef } from "../../utils/tokenRef";
import { ITokenRef, TokenRef } from "../../utils/deserializers";
import { TokenRefV0 } from "@wum.bo/spl-wumbo";

export interface ITokenWithMeta {
  metadataKey?: PublicKey;
  metadata?: Metadata;
  edition?: Edition;
  masterEdition?: MasterEditionV1 | MasterEditionV2;
  data?: IMetadataExtension;
  image?: string;
  description?: string;
}

export interface ITokenWithMetaAndAccount extends ITokenWithMeta {
  publicKey?: PublicKey;
  tokenRef?: ITokenRef;
  account?: AccountInfo;
}

export function getUserTokensWithMeta(
  cache: AccountFetchCache,
  connection: Connection,
  tokenAccounts?: TokenAccount[]
): Promise<ITokenWithMetaAndAccount[]> {
  return Promise.all(
    (tokenAccounts || []).map(async ({ pubkey, info }) => {
      const metadataKey = await getMetadata(info.mint);
      const reverseTokenRefKey = await getReverseTokenRefKey(info.mint)
      const { info: tokenRef } = (await cache.search(reverseTokenRefKey, (pubkey, account) => ({ pubkey, account, info: TokenRef(pubkey, account) }), true) || {});

      return {
        ...(await getTokenMetadata(cache, metadataKey)),
        tokenRef,
        publicKey: pubkey,
        account: info,
      };
    })
  );
}

export const MetadataParser: AccountParser<Metadata> = (pubkey, account) => ({
  pubkey,
  account,
  info: decodeMetadata(account.data),
});

export async function getEditionInfo(
  cache: AccountFetchCache,
  metadata: Metadata | undefined
): Promise<{
  edition?: Edition;
  masterEdition?: MasterEditionV1 | MasterEditionV2;
}> {
  if (!metadata) {
    return {};
  }

  const editionKey = await getEdition(metadata.mint);

  let edition;
  let masterEdition;
  const { info: editionOrMasterEdition } =
    (await cache.search(editionKey, (pubkey, account) => ({
      pubkey,
      account,
      info:
        account.data[0] == MetadataKey.EditionV1
          ? decodeEdition(account.data)
          : decodeMasterEdition(account.data),
    }), true)) || {};

  if (editionOrMasterEdition instanceof Edition) {
    edition = editionOrMasterEdition;
    const { info: masterEditionInfo } =
      (await cache.search(editionOrMasterEdition.parent, (pubkey, account) => ({
        pubkey,
        account,
        info: decodeMasterEdition(account.data),
      }), true)) || {};
    masterEdition = masterEditionInfo;
  } else {
    masterEdition = editionOrMasterEdition;
  }

  return {
    edition,
    masterEdition,
  };
}

export async function getTokenMetadata(
  cache: AccountFetchCache,
  metadataKey: PublicKey
): Promise<ITokenWithMeta> {
  const { info: metadata } =
    (await cache.search(metadataKey, MetadataParser, true)) || {};
  const data = await getArweaveMetadata(metadata?.data.uri);
  const image = data?.image;
  const description = data?.description;

  return {
    metadata,
    metadataKey,
    image,
    data,
    description,
    ...(metadata ? await getEditionInfo(cache, metadata) : {}),
  };
}

export function useUserTokensWithMeta(
  owner?: PublicKey
): UseAsyncReturn<ITokenWithMetaAndAccount[]> {
  const connection = useConnection();
  const { result: tokenAccounts, error } = useUserTokenAccounts(owner);
  const cache = useAccountFetchCache();

  const asyncResult = useAsync(getUserTokensWithMeta, [cache, connection, tokenAccounts]);
  return {
    ...asyncResult,
    error: asyncResult.error || error
  }
}

export interface IUseTokenMetadataResult extends ITokenWithMetaAndAccount {
  loading: boolean;
  error: Error | undefined;
}

export function useTokenMetadata(
  token: PublicKey | undefined
): IUseTokenMetadataResult {
  const {
    result: metadataAccountKey,
    loading,
    error,
  } = useAsync(getMetadataKey, [token]);
  const { info: metadata, loading: accountLoading } = useAccount(
    metadataAccountKey,
    (_, acct) => decodeMetadata(acct.data),
    true
  );

  const cache = useAccountFetchCache();
  const { result: editionInfo } = useAsync(getEditionInfo, [cache, metadata]);

  const wallet = useWallet();
  const { associatedAccount } = useAssociatedAccount(wallet.publicKey, token);
  const {
    result: data,
    loading: dataLoading,
    error: dataError,
  } = useAsync(getArweaveMetadata, [metadata?.data.uri]);
  const { info: tokenRef } = useClaimedTokenRef(wallet.publicKey || undefined);
  return {
    tokenRef,
    loading: Boolean(token && (loading || accountLoading || dataLoading)),
    error: error || dataError,
    metadata,
    metadataKey: metadataAccountKey,
    data,
    image: data?.image,
    account: associatedAccount,
    description: data?.description,
    publicKey: metadataAccountKey,
    ...editionInfo,
  };
}
