import React, { useState } from "react";
import { Button, Alert, AlertIcon } from "@chakra-ui/react";
import {
  useSolOwnedAmount,
  useRentExemptAmount,
  useErrorHandler,
  useFtxPayLink,
  useProvider,
  useClaimedTokenRefKey,
} from "@strata-foundation/react";
import { useCreateOrClaimCoin } from "../utils/claim";
import { TWITTER_REGISTRY_SIZE } from "../utils/twitter";
import { Spinner } from "../Spinner";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

export interface IClaimProps {
  onComplete(result: { tokenRef: PublicKey; owner: PublicKey }): void;
  redirectUri: string;
  code: string;
  handle?: string;
}
export const Claim = React.memo(
  ({ handle, redirectUri, code, onComplete }: IClaimProps) => {
    const { handleErrors } = useErrorHandler();
    const ftxPayLink = useFtxPayLink();
    const [twitterHandle, setTwitterHandle] = useState<string>(handle || "");
    const { awaitingApproval } = useProvider();
    const {
      create,
      error: createCoinError,
      creating,
      awaitingApproval: createAwaitingApproval,
    } = useCreateOrClaimCoin();

    const { amount: sol, loading: solLoading } = useSolOwnedAmount();
    const {
      amount: amountNeeded,
      loading: amountNeededLoading,
      error: rentExemptError,
    } = useRentExemptAmount(
      TWITTER_REGISTRY_SIZE + 512 + 3 * 312 // bonding, token refx3
    );
    const { wallet } = useWallet();
    const tokenRef = useClaimedTokenRefKey(wallet?.adapter?.publicKey, null);

    handleErrors(rentExemptError, createCoinError);

    if (solLoading || amountNeededLoading) {
      return (
        <div className="flex flex-row">
          <Spinner size="md" /> <span>Checking your wallet...</span>
        </div>
      );
    }

    if (sol < amountNeeded!) {
      return (
        <div className="p-4 flex flex-col">
          <span>
            It looks like you don't have any SOL. It costs around{" "}
            {amountNeeded!.toFixed(4)} SOL to claim your twitter handle and
            coin. Get some with FTX Pay:
          </span>
          <Button
            marginTop={2}
            colorScheme="indigo"
            variant="link"
            onClick={() => window.open(ftxPayLink)}
          >
            Get SOL
          </Button>
        </div>
      );
    }

    const loading = creating || awaitingApproval;

    return (
      <div className="flex flex-col">
        <span className="text-md">Twitter Handle</span>
        <input
          value={twitterHandle}
          onChange={(e) => setTwitterHandle(e.target.value)}
          placeholder="@TeamWumbo"
          className="p-2 border-1 mb-2 border-grey-300 rounded-lg hover:bg-grey-300"
        />

        <Button
          w="full"
          marginTop={2}
          colorScheme="indigo"
          isLoading={loading}
          onClick={() => {
            const twitterHandleSanitized = twitterHandle.replace("@", "");
            create({
              twitterHandle: twitterHandleSanitized,
              code,
              redirectUri,
            }).then(() =>
              onComplete({
                tokenRef: tokenRef!,
                owner: wallet?.adapter!.publicKey!,
              })
            );
          }}
        >
          {awaitingApproval && "Awaiting Approval"}
          {creating && "Creating your Coin"}
          {!(awaitingApproval || loading) && "Claim"}
        </Button>
      </div>
    );
  }
);
