import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { MintInfo, MintLayout, u64 } from "@solana/spl-token";
import { SOL_TOKEN } from "../constants/globals";
import { Numberu64 } from "@bonfida/spl-name-service";
import { useConnection } from "../contexts/connection";

export class Mint {
  static fromAccount(account: AccountInfo<Buffer>): MintInfo {
    if (!account) {
      return account;
    }

    const data = Buffer.from(account.data);
    const mintInfo = MintLayout.decode(data);
    if (mintInfo.mintAuthorityOption === 0) {
      mintInfo.mintAuthority = null;
    } else {
      mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
    }

    mintInfo.supply = u64.fromBuffer(mintInfo.supply);

    return mintInfo;
  }

  static async retrieve(
    connection: Connection,
    key: PublicKey
  ): Promise<MintInfo | null> {
    const info = await connection.getAccountInfo(key);

    if (!info) {
      return info;
    }

    if (info.data.length != MintLayout.span) {
      throw new Error(`Invalid mint size`);
    }

    return this.fromAccount(info);
  }
}

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


