import React, { useState } from "react";
import { CreateSocialTokenResult, TokenRef } from "@wum.bo/spl-wumbo";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import { useClaim, useCreateCoin } from "../utils/claim";
import { useSolOwnedAmount, useRentExemptAmount } from "../utils/pricing";
import { TWITTER_REGISTRY_SIZE } from "../utils/twitter";
import { Spinner } from "../Spinner";
import { Button, LinkButton } from "../Button";
import { Alert } from "../Alert";
import { useFtxPayLink } from "../utils/ftxPay";

export interface IClaimProps {
  onComplete(result: CreateSocialTokenResult): void;
  redirectUri: string;
  code: string;
  handle?: string;
}
export const Claim = React.memo(({ handle, redirectUri, code, onComplete }: IClaimProps) => {
  const ftxPayLink = useFtxPayLink();
  const [twitterHandle, setTwitterHandle] = useState<string>(handle || "");
  const {
    claim,
    error,
    awaitingApproval: claimAwaitingApproval,
    claiming,
  } = useClaim({ redirectUri, code });
  const {
    create,
    error: createCoinError,
    creating,
    awaitingApproval: createAwaitingApproval,
  } = useCreateCoin();

  const { amount: sol, loading: solLoading } = useSolOwnedAmount();
  const { amount: amountNeeded, loading: amountNeededLoading } = useRentExemptAmount(
    TWITTER_REGISTRY_SIZE + TokenRef.LEN + TokenBondingV0.LEN
  );

  if (error) {
    console.error(error);
  }

  if (createCoinError) {
    console.error(createCoinError);
  }

  if (solLoading || amountNeededLoading) {
    return (
      <div className="flex flex-row">
        <Spinner size="md" /> <span>Checking your wallet...</span>
      </div>
    );
  }

  if (sol < amountNeeded!) {
    return (
      <div className="flex flex-col">
        <span>
          It looks like you don't have any SOL. It costs around {amountNeeded!.toFixed(4)} SOL to
          claim your twitter handle and coin. Get some with FTX Pay:
        </span>
        <LinkButton target="_blank" className="mt-2" href={ftxPayLink} color="primary">
          Get SOL
        </LinkButton>
      </div>
    );
  }

  const loading = claiming || creating || claimAwaitingApproval || createAwaitingApproval;
  const awaitingApproval = claimAwaitingApproval || createAwaitingApproval;

  return (
    <div className="flex flex-col">
      <span className="text-md">Twitter Handle</span>
      <input
        value={twitterHandle}
        onChange={(e) => setTwitterHandle(e.target.value)}
        placeholder="@TeamWumbo"
        className="p-2 border-1 mb-2 border-grey-300 rounded-lg hover:bg-grey-300"
      />

      {error && <Alert type="error" message={error.message} />}

      <Button
        block
        className="mt-2"
        color="primary"
        onClick={() => {
          const twitterHandleSanitized = twitterHandle.replace("@", "");
          claim(twitterHandleSanitized)
            .then(() => create(twitterHandleSanitized))
            .then(onComplete);
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
  );
});
