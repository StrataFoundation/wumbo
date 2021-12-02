import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection } from "../contexts/connection";
import { TokenAccount, TokenAccountParser } from "@oyster/common";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { truthy } from "../utils";

export const useUserTokenAccounts = (
  owner?: PublicKey
): {
  data: TokenAccount[];
  loading: Boolean;
  error: Error | undefined;
} => {
  const connection = useConnection();
  const [data, setData] = useState<TokenAccount[]>([]);
  const [loading, setLoading] = useState<Boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    (async function () {
      if (owner) {
        try {
          setLoading(true);
          // user accounts are updated via ws subscription
          const accounts = await connection.getTokenAccountsByOwner(owner, {
            programId: TOKEN_PROGRAM_ID,
          });

          const tokenAccounts = accounts.value
            .map((info) => TokenAccountParser(info.pubkey, info.account))
            .filter(truthy)
            .filter((t) => t.info.amount.toNumber() > 0);

          setData(tokenAccounts);
        } catch (e) {
          setError(e);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [owner, setData, setLoading, setError]);

  return { data, loading, error };
};
