import React, { useEffect } from "react";
import { Spinner, useQuery, useWallet } from "wumbo-common";
import { useAsyncCallback } from "react-async-hook";
import { postTwitterRegistrarRequest } from "wumbo-common";
import { useLocalStorageState, useConnection } from "@oyster/common";
import { Transaction } from "@solana/web3.js";

interface ClaimingState {
  loading: boolean;
  error: Error | undefined;
}
function useClaiming(code: string): ClaimingState {
  const query = useQuery();
  
  const transaction = Transaction.from(useLocalStorageState("claim-txn")[0]);
  const auth0State = useLocalStorageState("auth0-state")[0];
  const redirectUri = useLocalStorageState("redirect-uri")[0];
  const twitterHandle = useLocalStorageState("twitter-handle")[0];

  const { execute, loading, error } = useAsyncCallback(postTwitterRegistrarRequest);
  const isStateMatch = query.get("state") != auth0State;
  useEffect(() => {
    if (isStateMatch) {
      execute(
        transaction,
        transaction.feePayer!,
        code,
        redirectUri,
        twitterHandle
        )
    }
  }, [])

  if (!isStateMatch) {
    return {
      loading: false,
      error: new Error("State did not match")
    }
  } else {
    return {
      loading,
      error
    }
  }
}

export default React.memo(({ code }: { code: string }) => {
  const { loading, error } = useClaiming(code)
  if (error) {
    console.error(error)
  }
  if (loading) {
    return <div className="flex flex-row">
      <Spinner size="lg" />
      <span>Claiming your handle</span>
    </div>
  }

  return <div>
    Successfully claimed your handle!
  </div>
})