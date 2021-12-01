import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection } from "../contexts/connection";
import { TokenAccount, TokenAccountParser } from "@oyster/common";
import { useAsync } from "react-async-hook";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { truthy } from "../utils";

export const getUserTokenAccounts = async (
  connection: Connection,
  owner?: PublicKey
): Promise<TokenAccount[]> => {
  if (!owner) {
    return [];
  }

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
