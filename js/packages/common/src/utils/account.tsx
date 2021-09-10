import { AccountInfo, Commitment, Connection, PublicKey } from "@solana/web3.js";
import { TokenAccount, useConnection, ParsedAccountBase, TokenAccountParser } from "@oyster/common";
import React, { useState, useEffect, useContext, useMemo } from "react";
import { useAsync } from "react-async-hook";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountFetchCache, AccountParser } from "./accountFetchCache/accountFetchCache";
import { truthy } from "./truthy";

export interface UseAccountState<T> {
  loading: boolean;
  account?: AccountInfo<Buffer>;
  info?: T;
}

export type TypedAccountParser<T> = (
  pubkey: PublicKey,
  data: AccountInfo<Buffer>
) => T;

export const AccountCacheContext = React.createContext<AccountFetchCache | null>(null);

export function useAccountFetchCache(): AccountFetchCache {
  return useContext(AccountCacheContext)!;
}

export const AccountCacheContextProvider: React.FC = ({ children }) => {
  const connection = useConnection();
  const cache = useMemo(() => {
    const ret = new AccountFetchCache({
      connection,
      delay: 150,
      commitment: "confirmed"
    })
    // Make sure everything in our app is using the cache
    connection.getAccountInfo = function(
      publicKey: PublicKey,
      commitment?: Commitment,
    ): Promise<AccountInfo<Buffer> | null> {
      if (commitment) {
        return connection.getAccountInfo(publicKey, commitment);
      }

      return ret.search(publicKey).then(i => {
        if (i) {
          return i.account;
        }

        return null;
      })
    }

    return ret;
  }, [connection]);

  return <AccountCacheContext.Provider
    value={cache}
  >
    {children}
  </AccountCacheContext.Provider>
}

export function useAccount<T>(
  key: undefined | PublicKey,
  parser?: TypedAccountParser<T>
): UseAccountState<T> {
  const cache = useAccountFetchCache();
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
      return;
    }

    cache
      .search(id, parsedAccountBaseParser)
      .then((acc) => {
        if (acc) {
          setState({
            loading: false,
            info: acc.info as any,
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
      if (event.id === id) {
        cache.query(id, parsedAccountBaseParser).then((acc) => {
          setState({
            loading: false,
            info: acc!.info as any,
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

let currentFetch: Map<string, Promise<TokenAccount[]>> = new Map();
const precachedOwners = new Map<string, TokenAccount[]>();
export const getUserTokenAccounts = async (
  connection: Connection,
  owner?: PublicKey,
): Promise<TokenAccount[]> => {
  if (!owner) {
    return [];
  }

  const ownerStr = owner.toBase58();
  if (precachedOwners.has(ownerStr)) {
    return precachedOwners.get(ownerStr)!;
  }

  if (currentFetch.has(ownerStr)) {
    return currentFetch.get(ownerStr)!;
  }

  currentFetch.set(ownerStr, (async () => {
    // user accounts are updated via ws subscription
    const accounts = await connection.getTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });
  
    const tokenAccounts = accounts.value.map(info =>
      TokenAccountParser(info.pubkey, info.account)
    ).filter(truthy);
  
    currentFetch.delete(ownerStr);
    // used for filtering account updates over websocket
    precachedOwners.set(owner.toBase58(), tokenAccounts);
  
    return tokenAccounts;
  })());

  return currentFetch.get(ownerStr)!;
};

export function useUserTokenAccounts(owner?: PublicKey) {
  const connection = useConnection();
  return useAsync(getUserTokenAccounts, [connection, owner])
}
