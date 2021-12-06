import { useEffect, useState } from "react";
import { claimPath, routes } from "@/constants/routes";
import { useHistory } from "react-router-dom";
import {
  useConnection,
  IClaimFlowOutput,
  useClaimLink,
  useClaimTwitterHandle,
  useCreateOrClaimCoin,
  useReverseTwitter,
  useWallet,
  claimTwitterHandle,
} from "wumbo-common";
import { useAsyncCallback } from "react-async-hook";

let claimWindow: Window | undefined;

export function useClaimFlow(name?: string | null): IClaimFlowOutput {
  const history = useHistory();
  const { claim, redirectUri } = useClaimLink({
    handle: `${name}`,
    newTab: true,
  });
  const connection = useConnection();
  const { publicKey, adapter } = useWallet();
  const { handle: ownerTwitterHandle, error: reverseTwitterError } =
    useReverseTwitter(publicKey || undefined);
  const {
    create,
    error: createCoinError,
    creating,
    awaitingApproval: createAwaitingApproval,
  } = useCreateOrClaimCoin();

  async function createTwitter() {
    claimWindow = claim() || undefined;
    const oauthResult = await new Promise<any>((resolve, reject) => {
      const fn = (msg: any, _: any, sendResponse: any) => {
        if (msg.type == "CLAIM") {
          claimWindow?.close();
          resolve(msg.data);
          chrome.runtime.onMessage.removeListener(fn);
        }

        sendResponse();
      };
      chrome.runtime.onMessage.addListener(fn);
    });
    await claimTwitterHandle({
      connection,
      adapter,
      redirectUri,
      ...oauthResult,
      twitterHandle: name,
    });
  }

  const smartClaim = async () => {
    if (!ownerTwitterHandle) {
      await createTwitter();
    }

    name && (await create(name));
    history.push(routes.editProfile.path);
  };

  const { loading, execute, error } = useAsyncCallback(smartClaim);

  return {
    claim: execute,
    loading: creating || loading,
    error: error || createCoinError || reverseTwitterError,
  };
}
