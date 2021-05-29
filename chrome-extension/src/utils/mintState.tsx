import { AccountInfo, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { MintInfo } from "@solana/spl-token";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { Mint } from "../wumbo-api/state";

export function useMint(key: PublicKey | undefined): MintInfo | undefined {
  const [mint, setMint] = useState<MintInfo>();
  const connection = useConnection();

  useEffect(() => {
    if (key) {
      const sub = connection.onAccountChange(
        key,
        (account: AccountInfo<Buffer>) => {
          setMint(Mint.fromAccount(account));
        },
        "singleGossip"
      );
      (async () => {
        const mintInfo = await Mint.retrieve(connection, key);
        mintInfo && setMint(mintInfo);
      })();

      return () => {
        connection.removeAccountChangeListener(sub);
      };
    }
  }, [key]);

  return mint;
}
