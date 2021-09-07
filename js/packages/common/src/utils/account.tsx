import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { TokenAccount, useConnection, ParsedAccountBase, TokenAccountParser } from "@oyster/common";
import React, { useState, useEffect, useContext } from "react";
import { useAsync } from "react-async-hook";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Cache, AccountParser } from "./accountFetchCache/accountFetchCache";

export interface UseAccountState<T> {
  loading: boolean;
  account?: AccountInfo<Buffer>;
  info?: T;
}

export type TypedAccountParser<T> = (
  pubkey: PublicKey,
  data: AccountInfo<Buffer>
) => T;

export const AccountCacheContext = React.createContext(new Cache({
  commitment: "confirmed"
}));

export function useAccountFetchCache(): Cache {
  return useContext(AccountCacheContext);
}

export const AccountCacheContextProvider: React.FC = ({ children }) => {
  return <AccountCacheContext.Provider
    value={new Cache({
      commitment: "confirmed"
    })}
  >
    { children }
  </AccountCacheContext.Provider>
}

export function useAccount<T>(
  key: undefined | PublicKey,
  parser?: TypedAccountParser<T>
): UseAccountState<T> {
  const connection = useConnection();
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
      .query(connection, id, parsedAccountBaseParser)
      .then((acc) => {
        setState({
          loading: false,
          info: acc!.info as any,
          account: acc!.account,
        });
      })
      .catch((err) => {
        console.log(err);
        // Oyster's cache, while great, explodes and doesn't watch accounts that don't exist. Shim it in
        if (key) {
          let subId: number;
          function addToCache(acc: AccountInfo<Buffer>) {
            if (key) {
              cache.add(key, acc, parsedAccountBaseParser);
            }
            connection.removeAccountChangeListener(subId);
          }
          subId = connection.onAccountChange(key, addToCache);
        }

        setState({ loading: false });
      });

    const dispose = cache.emitter.onCache((e) => {
      const event = e;
      if (event.id === id) {
        cache.query(connection, id, parsedAccountBaseParser).then((acc) => {
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
  }, [connection, id]);

  return state;
}

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T; // from lodash

function truthy<T>(value: T): value is Truthy<T> {
    return !!value;
}

const PRECACHED_OWNERS = new Map<string, TokenAccount[]>();
export const getUserTokenAccounts = async (
  connection: Connection,
  owner?: PublicKey,
): Promise<TokenAccount[]> => {
  if (!owner) {
    return [];
  }

  debugger;

  if (PRECACHED_OWNERS.has(owner.toBase58())) {
    return PRECACHED_OWNERS.get(owner.toBase58())!
  }

  // user accounts are updated via ws subscription
  const accounts = await connection.getTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  const tokenAccounts = accounts.value.map(info =>
    TokenAccountParser(info.pubkey, info.account)
  ).filter(truthy);

  // used for filtering account updates over websocket
  PRECACHED_OWNERS.set(owner.toBase58(), tokenAccounts);

  return tokenAccounts;
};

export function useUserTokenAccounts(owner?: PublicKey) {
  const connection = useConnection();
  return useAsync(getUserTokenAccounts, [connection, owner])
}
