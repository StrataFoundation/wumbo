import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import {
  useStrataSdks,
  useWalletTokenAccounts,
} from "@strata-foundation/react";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";

export const useUserTokensWithMeta = (
  owner?: PublicKey
): {
  data: ITokenWithMetaAndAccount[];
  loading: boolean;
  error: Error | undefined;
} => {
  const { tokenCollectiveSdk } = useStrataSdks();
  const [data, setData] = useState<ITokenWithMetaAndAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const {
    result: tokenAccounts,
    loading: loadingTokenAccounts,
    error: tokenAccountsError,
  } = useWalletTokenAccounts(owner);

  useEffect(() => {
    (async function () {
      if (owner && tokenAccounts) {
        try {
          setLoading(true);
          const tokenAccountsWithMeta =
            await tokenCollectiveSdk!.getUserTokensWithMeta(tokenAccounts);
          setData(tokenAccountsWithMeta);
        } catch (e: any) {
          setError(e);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [owner, tokenAccounts, tokenCollectiveSdk, setData, setLoading, setError]);

  return {
    data,
    loading: loading || loadingTokenAccounts,
    error: error || tokenAccountsError,
  };
};
