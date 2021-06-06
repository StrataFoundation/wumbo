import { useConnection } from "@oyster/common/lib/contexts/connection";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import {
  ParsedAccount,
  cache,
  ParsedAccountBase,
} from "@oyster/common/lib/contexts/accounts";
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
  key: undefined | string | PublicKey,
  parser: TypedAccountParser<T>
): UseAccountState<T> {
  const connection = useConnection();
  const [state, setState] = useState<UseAccountState<T>>({
    loading: true,
  });

  function parsedAccountBaseParser(
    pubkey: PublicKey,
    data: AccountInfo<Buffer>
  ): ParsedAccountBase {
    const info = parser(pubkey, data);
    return {
      pubkey,
      account: data,
      info,
    };
  }

  const id = typeof key === "string" ? key : key?.toBase58();

  useEffect(() => {
    if (!id) {
      return;
    }

    cache
      .query(connection, id, parsedAccountBaseParser)
      .then((acc) =>
        setState({
          loading: false,
          info: acc.info as any,
          account: acc.account,
        })
      )
      .catch((err) => {
        console.log(err)
        setState({ loading: false })
      });

    const dispose = cache.emitter.onCache((e) => {
      const event = e;
      if (event.id === id) {
        cache.query(connection, id, parsedAccountBaseParser).then((acc) =>
          setState({
            loading: false,
            info: acc.info as any,
            account: acc.account,
          })
        );
      }
    });
    return () => {
      dispose();
    };
  }, [connection, id]);

  return state;
}
