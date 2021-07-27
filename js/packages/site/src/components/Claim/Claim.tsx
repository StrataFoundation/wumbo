import React, { useEffect, useState } from "react";
import AppContainer from "../common/AppContainer";
import { Redirect } from "react-router";
import routes from "../../constants/routes";
import { getTokenRefKey, createTestTld, useAccount, useRentExemptAmount, Alert, TWITTER_REGISTRY_SIZE, LinkButton, Button, claimTwitterTransactionInstructions, postTwitterRegistrarRequest, Spinner, useQuery, useWallet, useSolOwnedAmount, WUMBO_INSTANCE_KEY, getTwitterHandle, TOKEN_BONDING_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID, WUMBO_PROGRAM_ID, SPL_NAME_SERVICE_PROGRAM_ID, TWITTER_ROOT_PARENT_REGISTRY_KEY, getTld } from "wumbo-common";
import { useLocation, useHistory } from "react-router-dom";
import { createWumboSocialToken, TokenRef, WumboInstance, CreateSocialTokenResult } from "spl-wumbo";
import { TokenBondingV0 } from "spl-token-bonding";
import { useAsyncCallback } from "react-async-hook";
import { useConnection } from "@oyster/common";
import { Connection } from "@solana/web3.js";
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
        await createTestTld(connection, wallet);
        const instructions = await claimTwitterTransactionInstructions(connection, {
          owner: wallet.publicKey!,
          twitterHandle
        });
        if (instructions) {
          setClaiming(true);
          await postTwitterRegistrarRequest(connection, instructions, wallet, code!, redirectUri!, twitterHandle);
        }
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

interface CreateState {
  awaitingApproval: boolean;
  creating: boolean;
  error: Error | undefined;
  create: (twitterHandle: string) => Promise<CreateSocialTokenResult>;
}
function useCreateCoin(): CreateState {
  const connection = useConnection();
  const { wallet } = useWallet();
  const [creating, setCreating] = useState<boolean>(false);
  const { info: wumboInstance } = useAccount(
    WUMBO_INSTANCE_KEY,
    WumboInstance.fromAccount
  );
  
  async function exec(twitterHandle: string) {
    let result;
    try {
      setCreating(true)
      const key = await getTokenRefKey(connection, twitterHandle);
      const account = await connection.getAccountInfo(key);
      if (!account) {
        console.log("Creator does not exist, creating")
        result = await createWumboSocialToken(
          connection,
          {
            splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
            splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
            splTokenProgramId: TOKEN_PROGRAM_ID,
            splWumboProgramId: WUMBO_PROGRAM_ID,
            splNameServicePogramId: SPL_NAME_SERVICE_PROGRAM_ID,
            wumboInstance: WUMBO_INSTANCE_KEY,
            payer: wallet!,
            baseMint: wumboInstance!.wumboMint,
            name: twitterHandle,
            founderRewardsPercentage: 5.5,
            nameParent: await getTld(),
          }
        )
      } else {
        const creator = TokenRef.fromAccount(key, account);
        result = {
          tokenRefKey: creator.publicKey,
          tokenBondingKey: creator.tokenBonding,
          ownerKey: wallet?.publicKey!
        }
      }
    } finally {
      setCreating(false)
    }

    return result;
  }

  const { execute, loading, error } = useAsyncCallback(exec);
  return {
    awaitingApproval: loading && !creating,
    creating,
    error,
    create: execute
  }
}

export const ClaimRoute = React.memo(() => <AppContainer>
  <Claim />
</AppContainer>)

export const Claim = React.memo(() => {  
  const { wallet, connected } = useWallet();
  const history = useHistory();
  const location = useLocation();
  const [twitterHandle, setTwitterHandle] = useState<string>("");
  const redirectUri = routes.wallet.path + `?redirect=${location.pathname}${location.search}`;
  const { claim, error, awaitingApproval: claimAwaitingApproval, claiming } = useClaim();
  const { create, error: createCoinError, creating, awaitingApproval: createAwaitingApproval } = useCreateCoin();

  const { amount: sol, loading: solLoading } = useSolOwnedAmount();
  const { amount: amountNeeded, loading: amountNeededLoading } = useRentExemptAmount(TWITTER_REGISTRY_SIZE + TokenRef.LEN + TokenBondingV0.LEN)

  if (error) {
    console.error(error)
  }

  if (createCoinError) {
    console.error(createCoinError)
  }

  if (!connected) {
    return <Redirect to={redirectUri} />
  }

  if (solLoading || amountNeededLoading) {
    return <div className="flex flex-row">
      <Spinner size="md" /> <span>Checking your wallet...</span>
    </div>
  }

  if (sol < amountNeeded!) {
    const ftxPayLink = `https://ftx.com/pay/request?coin=SOL&address=${wallet?.publicKey?.toBase58()}&tag=&wallet=sol&memoIsRequired=false&memo=&fixedWidth=true`
    return <div className="flex flex-col">
      <span>It looks like you don't have any SOL. It costs around {amountNeeded!.toFixed(4)} SOL to claim your twitter handle and coin. Get some with FTX Pay:</span>
      <LinkButton target="_blank" className="mt-2" href={ftxPayLink} color="primary">Get SOL</LinkButton>
    </div>
  }

  const loading = claiming || creating || claimAwaitingApproval || createAwaitingApproval;
  const awaitingApproval = claimAwaitingApproval || createAwaitingApproval;

  return <div className="flex flex-col">
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
        const twitterHandleSanitized = twitterHandle.replace("@", "");
        claim(twitterHandleSanitized).then(() => create(twitterHandleSanitized)).then(({ ownerKey }) => {
          history.push(routes.editProfile.path.replace(":ownerWalletKey", ownerKey.toBase58()))
        })
      }}
      disabled={loading}
    >
      {loading && (
        <div className="mr-4">
          <Spinner size="sm" />
        </div>
      )}
      {awaitingApproval && "Awaiting Approval"}
      {claiming && "Claiming"}
      {creating && "Creating your Coin"}
      {!(awaitingApproval || loading) && "Claim"}
    </Button>
  </div>
})