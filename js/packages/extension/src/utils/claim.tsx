import { useEffect, useState } from "react";
import { claimPath, routes } from "@/constants/routes";
import { useHistory  } from "react-router";
import { IClaimFlowOutput, useClaimLink, useCreateOrClaimCoin, useReverseTwitter, useWallet } from "wumbo-common";

export function useClaimFlow(name?: string | null): IClaimFlowOutput {
  const history = useHistory();
  const { claim, redirectUri } = useClaimLink({ handle: `${name}` });
  const [claimWindow, setClaimWindow] = useState<Window>();
  const { publicKey } = useWallet();
  const { handle: ownerTwitterHandle } = useReverseTwitter(publicKey || undefined);
  const {
    create,
    error: createCoinError,
    creating,
    awaitingApproval: createAwaitingApproval,
  } = useCreateOrClaimCoin();

  useEffect(() => {
    const fn = (msg: any, _: any, sendResponse: any) => {
      if (msg.type == "CLAIM") {
        claimWindow?.close();
        history.push(claimPath({ ...msg.data, redirectUri }));
      }
  
      sendResponse();
      return true;
    }
    chrome.runtime.onMessage.addListener(fn);
    () => chrome.runtime.onMessage.removeListener(fn);
  }, [])
  
  const smartClaim = () => {
    if (!ownerTwitterHandle) {
      setClaimWindow(claim() || undefined)
    } else {
      name && create(name).then(() => {
        history.push(routes.editProfile.path)
      })
    }
  }

  return {
    claim: smartClaim,
    loading: creating,
    error: createCoinError
  }
}
