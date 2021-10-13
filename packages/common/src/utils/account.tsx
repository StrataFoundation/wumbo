import {
  AccountInfo,
  Commitment,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { useConnection } from "../contexts/connection";
import {
  TokenAccount,
  ParsedAccountBase,
  TokenAccountParser,
} from "@oyster/common";
import React, { useState, useEffect, useContext, useMemo } from "react";
import { useAsync } from "react-async-hook";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  AccountFetchCache,
  AccountParser,
} from "./accountFetchCache/accountFetchCache";
import { truthy } from "./truthy";
import { DEFAULT_COMMITMENT } from "../constants/globals";

export interface UseAccountState<T> {
  loading: boolean;
  account?: AccountInfo<Buffer>;
  info?: T;
}

export type TypedAccountParser<T> = (
  pubkey: PublicKey,
  data: AccountInfo<Buffer>
) => T;

export const AccountCacheContext =
  React.createContext<AccountFetchCache | null>(null);

export function useAccountFetchCache(): AccountFetchCache {
  return useContext(AccountCacheContext)!;
}

export const AccountCacheContextProvider: React.FC = ({ children }) => {
  const connection = useConnection();
  const cache = React.useMemo(() => {
    return new AccountFetchCache({
      connection,
      delay: 500,
      commitment: DEFAULT_COMMITMENT,
    });
  }, [connection]);

  useEffect(() => {
    const oldGetAccountInfo = connection.getAccountInfo.bind(connection);
    // Make sure everything in our app is using the cache
    connection.getAccountInfo = function (
      publicKey: PublicKey,
      commitment?: Commitment
    ): Promise<AccountInfo<Buffer> | null> {
      if (commitment && commitment != DEFAULT_COMMITMENT) {
        return oldGetAccountInfo(publicKey, commitment);
      }

      return cache.search(publicKey).then((i) => {
        if (i) {
          return i.account;
        }

        return null;
      });
    };

    return () => {
      cache.close();
    };
  }, [connection]);

  return (
    <AccountCacheContext.Provider value={cache}>
      {children}
    </AccountCacheContext.Provider>
  );
};

export function useAccount<T>(
  key: undefined | PublicKey,
  parser?: TypedAccountParser<T>,
  isStatic: Boolean = false // Set if the accounts data will never change, optimisation to lower websocket usage.
): UseAccountState<T> {
  const cache = useAccountFetchCache();
  // @ts-ignore for helping to debug
  window.cache = cache;
  const [state, setState] = useState<UseAccountState<T>>({
    loading: true,
  });

  const parsedAccountBaseParser = (
    pubkey: PublicKey,
    data: AccountInfo<Buffer>
  ): ParsedAccountBase => {
    const info = parser && parser(pubkey, data);
    return {
      pubkey,
      account: data,
      info,
    };
  };

  const id = typeof key === "string" ? key : key?.toBase58();

  useEffect(() => {
    if (!id) {
      setState({ loading: false });
      return;
    } else {
      setState({ loading: true });
    }

    cache
      .searchAndWatch(id, parsedAccountBaseParser, isStatic)
      .then((acc) => {
        if (acc) {
          setState({
            loading: false,
            info: (parser && parser(acc.pubkey, acc!.account)) as any,
            account: acc.account,
          });
        } else {
          setState({ loading: false });
        }
      })
      .catch((e) => {
        console.error(e);
        setState({ loading: false });
      });

    const dispose = cache.emitter.onCache((e) => {
      const event = e;
      if (event.id === id && !event.isNew) {
        cache.query(id, parsedAccountBaseParser).then((acc) => {
          setState({
            loading: false,
            info: (parser && parser(acc.pubkey, acc!.account)) as any,
            account: acc!.account,
          });
        });
      }
    });
    return () => {
      dispose();
    };
  }, [cache, id]);

  return state;
}

export const getUserTokenAccounts = async (
  connection: Connection,
  owner?: PublicKey
): Promise<TokenAccount[]> => {
  if (!owner) {
    return [];
  }

  const ownerStr = owner.toBase58();
  // user accounts are updated via ws subscription
  const accounts = await connection.getTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  const tokenAccounts = accounts.value
    .map((info) => TokenAccountParser(info.pubkey, info.account))
    .filter(truthy)
    .filter((t) => t.info.amount.toNumber() > 0);

  return tokenAccounts;
};

export function useUserTokenAccounts(owner?: PublicKey) {
  const connection = useConnection();
  return useAsync(getUserTokenAccounts, [connection, owner]);
}
