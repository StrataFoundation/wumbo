import { AccountInfo, PublicKey } from "@solana/web3.js";
import { useConnection, cache, ParsedAccountBase } from "@oyster/common";
import { useState, useEffect } from "react";

export interface UseAccountState<T> {
  loading: boolean;
  account?: AccountInfo<Buffer>;
  info?: T;
}

export type TypedAccountParser<T> = (
  pubkey: PublicKey,
  data: AccountInfo<Buffer>
) => T;

export function useAccount<T>(
  key: undefined | PublicKey,
  parser?: TypedAccountParser<T>
): UseAccountState<T> {
  const connection = useConnection();
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
          info: acc.info as any,
          account: acc.account,
        })
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
            info: acc.info as any,
            account: acc.account,
          })
        });
      }
    });
    return () => {
      dispose();
    };
  }, [connection, id]);

  return state;
}
