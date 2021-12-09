import { useWallet } from "@solana/wallet-adapter-react";
import { useProvider, useStrataSdks } from "@strata-foundation/react";
import { useState } from "react";
import { useAsyncCallback } from "react-async-hook";
import {
  WUMBO_IDENTITY_SERVICE_URL
} from "../constants/globals";
import { exectuteRemoteTxn } from "./executeRemoteTxn";

export type CreateArgs = { code?: string, redirectUri?: string, twitterHandle: string }
interface CreateState {
  awaitingApproval: boolean;
  creating: boolean;
  error: Error | undefined;
  create: (
    args: CreateArgs
  ) => Promise<string[]>;
}

export function useCreateOrClaimCoin(): CreateState {
  const { adapter } = useWallet();
  const [creating, setCreating] = useState<boolean>(false);
  const { awaitingApproval, provider } = useProvider();
  const { tokenCollectiveSdk } = useStrataSdks();

  async function exec({ twitterHandle, code, redirectUri }: CreateArgs) {
    let result;
    try {
      setCreating(true);
      result = await exectuteRemoteTxn(
        provider!,
        WUMBO_IDENTITY_SERVICE_URL + "/twitter/claim-or-create",
        {
          pubkey: adapter!.publicKey!.toBase58(),
          code, 
          redirectUri,
          twitterHandle
        },
        tokenCollectiveSdk?.errors
      )
    } finally {
      setCreating(false);
    }

    return result;
  }

  const { execute, error } = useAsyncCallback(exec);
  return {
    awaitingApproval,
    creating,
    error,
    create: execute,
  };
}
