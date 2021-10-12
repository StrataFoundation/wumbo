import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { MintInfo, MintLayout, u64 } from "@solana/spl-token";
import { SOL_TOKEN } from "../constants/globals";
import { Numberu64 } from "@bonfida/spl-name-service";
import { useConnection } from "../contexts/connection";
import { TokenAccountParser } from "../../../oyster-common/dist/lib";
import { useAccount } from "./account";

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
  const { info: mint } = useAccount(key, (pubkey, account) => Mint.fromAccount(account))

  return mint;
}


