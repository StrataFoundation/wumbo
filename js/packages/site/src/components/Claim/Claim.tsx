import React, { useEffect, useState } from "react";
import AppContainer from "../common/AppContainer";
import { Redirect } from "react-router";
import routes from "../../constants/routes";
import { Alert, Button, claimTwitterTransaction, postTwitterRegistrarRequest, Spinner, useQuery, useWallet } from "wumbo-common";
import { useLocation, useHistory } from "react-router-dom";
import TwitterButton from "../BetaSplash/TwitterButton";
import { Transaction, Connection } from "@solana/web3.js";
import { useAsyncCallback } from "react-async-hook";
import { useConnection, useConnectionConfig, useLocalStorageState } from "@oyster/common";
import { WalletAdapter } from "@solana/wallet-base";

interface ClaimTransactionState {
  awaitingApproval: boolean;
  claiming: boolean;
  error: Error | undefined;
  claim: (twitterHandle: string) => Promise<void>;
}

function useClaim(): ClaimTransactionState {
  const connection = useConnection();
  const { wallet } = useWallet();
  const [claiming, setClaiming] = useState<boolean>(false);
  const query = useQuery();
  const code = query.get("code");
  const redirectUri = `${window.location.origin.replace(/\/$/, "")}${routes.claim.path}`

  async function exec(twitterHandle: string) {
    if (wallet) {
      try {
        const transaction = await claimTwitterTransaction(connection, {
          wallet,
          twitterHandle
        });
        setClaiming(true);
        await postTwitterRegistrarRequest(transaction, transaction.feePayer!, code!, redirectUri!, twitterHandle);
      } finally {
        setClaiming(false);
      }

    }
  }
  const { execute, loading, error } = useAsyncCallback(exec);

  return {
    awaitingApproval: loading && !claiming,
    claiming,
    error,
    claim: execute
  }
}

export default React.memo(() => {
  const connectionConfig = useConnectionConfig();
  connectionConfig.setEndpoint("https://wumbo.devnet.rpcpool.com/");
  
  const { wallet, connected } = useWallet();
  const history = useHistory();
  const location = useLocation();
  const [twitterHandle, setTwitterHandle] = useState<string>("");
  const redirectUri = routes.wallet.path + `?redirect=${location.pathname}${location.search}`;
  const { claim, error, awaitingApproval, claiming } = useClaim();

  if (error) {
    console.error(error)
  }

  if (!connected) {
    return <Redirect to={redirectUri} />
  }

  return <AppContainer>
    <div className="flex flex-col">
      <span className="text-md">Twitter Handle</span>
      <input
        value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)}
        placeholder="@TeamWumbo"
        className="p-2 border-1 mb-2 border-grey-300 rounded-lg hover:bg-grey-300"
      />

      {error &&
        <Alert type="error" message={error.message} />
      }

      <Button
        block
        className="mt-2"
        color="primary"
        onClick={() => {
          claim(twitterHandle).then(createCoin).then((tokenBonding) => {
            history.push(routes.profile.path.replace(":key", wallet!.publicKey!.toBase58()))
          })
        }
        disabled={claiming || awaitingApproval}
      >
        {(claiming || awaitingApproval) && (
          <div className="mr-4">
            <Spinner size="sm" />
          </div>
        )}
        {awaitingApproval && "Awaiting Approval"}
        {claiming && "Claiming"}
        {!(awaitingApproval || claiming) && "Claim"}
      </Button>
    </div>
  </AppContainer>
})