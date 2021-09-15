import { useState } from "react";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { TokenRef, WumboInstance } from "./deserializers/spl-wumbo";
import {
  useConnection,
} from "@oyster/common";
import { useWallet } from "../contexts/walletContext";
import {
  createTestTld,
  claimTwitterTransactionInstructions,
  postTwitterRegistrarRequest,
  getTld,
} from "./twitter";
import { useAccount, useAccountFetchCache } from "./account";
import {
  WUMBO_INSTANCE_KEY,
} from "../constants/globals";
import { PublicKey } from "@solana/web3.js";
import { getTwitterRegistryKey, getTwitterRegistry } from "../utils";
import { usePrograms } from "./programs";
import { getTwitterClaimedTokenRefKey, getTwitterUnclaimedTokenRefKey } from "./tokenRef";

interface ClaimTransactionState {
  awaitingApproval: boolean;
  claiming: boolean;
  error: Error | undefined;
  claim: (twitterHandle: string) => Promise<void>;
}
export function useClaimTwitterHandle({
  redirectUri,
  code,
}: {
  redirectUri: string;
  code: string;
}): ClaimTransactionState {
  const connection = useConnection();
  const { adapter } = useWallet();
  const [claiming, setClaiming] = useState<boolean>(false);
  async function exec(twitterHandle: string) {
    try {
      setClaiming(true);

      if (adapter) {
        await createTestTld(connection, adapter);
        const instructions = await claimTwitterTransactionInstructions(connection, {
          owner: adapter.publicKey!,
          twitterHandle,
        });
        if (instructions) {
          await postTwitterRegistrarRequest(
            connection,
            instructions,
            adapter,
            code!,
            redirectUri!,
            twitterHandle
          );
        }
      }
    } finally {
      setClaiming(false);
    }
  }
  const { execute, loading, error } = useAsyncCallback(exec);

  return {
    awaitingApproval: loading && !claiming,
    claiming,
    error,
    claim: execute,
  };
}

interface CreateState {
  awaitingApproval: boolean;
  creating: boolean;
  error: Error | undefined;
  create: (twitterHandle: string) => Promise<{ tokenRef: PublicKey, owner: PublicKey }>;
}

export function useCreateCoin(): CreateState {
  const cache = useAccountFetchCache();
  const connection = useConnection();
  const { adapter, publicKey } = useWallet();
  const [creating, setCreating] = useState<boolean>(false);
  const { info: wumboInstance } = useAccount(WUMBO_INSTANCE_KEY, WumboInstance);
  const { splWumboProgram } = usePrograms();

  async function exec(twitterHandle: string) {
    let result;
    try {
      setCreating(true);
      const key =
        (await getTwitterClaimedTokenRefKey(connection, twitterHandle)) ||
        (await getTwitterUnclaimedTokenRefKey(twitterHandle));
      const twitterName = await getTwitterRegistryKey(twitterHandle, await getTld());
      const owner = (await getTwitterRegistry(connection, twitterHandle, await getTld())).owner;
      const account = (await cache.search(key))?.account;
      if (!account) {
        const isOwner = publicKey && owner.equals(publicKey);
        console.log("Creator does not exist, creating");

        const args = {
          wumbo: WUMBO_INSTANCE_KEY,
          tokenName: twitterHandle,
          // Only claim it as my own if this is my handle
          owner: isOwner ? owner : undefined,
          name: isOwner ? undefined : twitterName,
          nameParent: await getTld()
        }
        result = {
          ...await splWumboProgram!.createSocialToken(args),
          owner
        }
      } else {
        const creator = TokenRef(key, account);
        result = {
          tokenRef: creator!.publicKey,
          owner
        };
      }
    } finally {
      setCreating(false);
    }

    return result;
  }

  const { execute, loading, error } = useAsyncCallback(exec);
  return {
    awaitingApproval: loading && !creating,
    creating,
    error,
    create: execute,
  };
}
