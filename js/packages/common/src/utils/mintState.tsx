import { AccountInfo, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { MintInfo } from "@solana/spl-token";
import { useConnection } from "@oyster/common";
import { Mint } from "spl-wumbo";
import { SOL_TOKEN } from "../constants/globals";
import { Numberu64 } from "@bonfida/spl-name-service";

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
        try {
          const mintInfo = await Mint.retrieve(connection, key);
          if (mintInfo && key.toBase58() == SOL_TOKEN.toBase58()) {
            const result = await connection.getSupply();
            const supply = result.value.total;
            mintInfo.supply = new Numberu64(supply.toString());
          }
          mintInfo && setMint(mintInfo);
        } catch (e) {
          console.error(e);
        }
      })();

      return () => {
        connection.removeAccountChangeListener(sub);
      };
    }
  }, [key]);

  return mint;
}


