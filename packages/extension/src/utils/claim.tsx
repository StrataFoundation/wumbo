import { routes } from "@/constants/routes";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAsyncCallback } from "react-async-hook";
import { useHistory } from "react-router-dom";
import {
  IClaimFlowOutput,
  useClaimLink,
  useCreateOrClaimCoin,
  useReverseTwitter,
} from "wumbo-common";

let claimWindow: Window | undefined;

export function useClaimFlow(name?: string | null): IClaimFlowOutput {
  const history = useHistory();
  const { claim, redirectUri } = useClaimLink({
    handle: `${name}`,
    newTab: true,
  });
  const { adapter } = useWallet();
  const publicKey = adapter?.publicKey;
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
    await create({
      redirectUri,
      ...oauthResult,
      twitterHandle: name,
    });
  }

  const smartClaim = async () => {
    if (!ownerTwitterHandle) {
      await createTwitter();
    } else {
      name && (await create({ twitterHandle: name }));
    }
    history.push(routes.editProfile.path);
  };

  const { loading, execute, error } = useAsyncCallback(smartClaim);

  return {
    claim: execute,
    loading: creating || loading,
    error: error || createCoinError || reverseTwitterError,
  };
}
