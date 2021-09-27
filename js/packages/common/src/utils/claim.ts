import { useState } from "react";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { TokenRef, WumboInstance } from "./deserializers/spl-wumbo";
import { useConnection } from "../contexts/connection";
import { useWallet } from "../contexts/walletContext";
import {
  createTestTld,
  getTld,
} from "./twitter";
import { useAccount, useAccountFetchCache } from "./account";
import {
  DEV_TWITTER_TLD,
  DEV_TWITTER_VERIFIER,
  IS_DEV,
  TWITTER_REGISTRAR_SERVER_URL,
  WUMBO_INSTANCE_KEY,
} from "../constants/globals";
import { Connection, PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { getTwitterRegistryKey, getTwitterRegistry } from "../utils";
import { usePrograms } from "./programs";
import { getTwitterClaimedTokenRefKey, getTwitterUnclaimedTokenRefKey } from "./tokenRef";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import axios from "axios";
import { createVerifiedTwitterRegistry } from "./testableNameServiceTwitter";
import { NAME_PROGRAM_ID } from "@bonfida/spl-name-service";

interface ClaimTransactionState {
  awaitingApproval: boolean;
  claiming: boolean;
  error: Error | undefined;
  claim: (twitterHandle: string) => Promise<void>;
}
export async function claimTwitterHandle({
  redirectUri,
  code,
  twitterHandle,
  adapter,
  connection
}: {
  redirectUri: string;
  code: string;
  twitterHandle: string;
  adapter?: WalletAdapter;
  connection: Connection;
}): Promise<void> {
  if (adapter) {
    if (IS_DEV) {
      await createTestTld(connection, adapter);
      const instructions = await createVerifiedTwitterRegistry(
        connection,
        twitterHandle,
        adapter.publicKey!,
        212,
        adapter.publicKey!,
        NAME_PROGRAM_ID,
        DEV_TWITTER_VERIFIER.publicKey,
        await getTld()
      );
      const tx = new Transaction({
        recentBlockhash: (await connection.getRecentBlockhash('confirmed')).blockhash,
        feePayer: adapter.publicKey
      })
      tx.add(...instructions);
      tx.partialSign(DEV_TWITTER_VERIFIER);
      const signed = await adapter.signTransaction(tx)
      await sendAndConfirmRawTransaction(connection, signed.serialize(), {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
    } else {
      try {
        const resp = await axios.post(TWITTER_REGISTRAR_SERVER_URL, {
          redirectUri,
          code,
          twitterHandle,
          pubkey: adapter.publicKey?.toBase58()
        }, {
          responseType: "json",
        });
        const tx = Transaction.from(resp.data.data);
        const signed = await adapter.signTransaction(tx)
        await sendAndConfirmRawTransaction(connection, signed.serialize(), {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed'
        });
      } catch (e) {
        if (e.response?.data?.message) {
          throw new Error(e.response.data.message)
        }
        throw e;
      }

    }
  }
}
export function useClaimTwitterHandle({
  redirectUri,
  code,
}: {
  redirectUri: string;
  code: string;
}): ClaimTransactionState {
  const connection = useConnection();
  const { adapter, awaitingApproval } = useWallet();
  function exec(twitterHandle: string) {
    return claimTwitterHandle({
      redirectUri,
      code,
      twitterHandle,
      adapter,
      connection
    })
  }
  const { loading: claiming, execute, error } = useAsyncCallback(exec);

  return {
    awaitingApproval,
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

export function useCreateOrClaimCoin(): CreateState {
  const cache = useAccountFetchCache();
  const connection = useConnection();
  const { adapter, publicKey } = useWallet();
  const [creating, setCreating] = useState<boolean>(false);
  const { info: wumboInstance } = useAccount(WUMBO_INSTANCE_KEY, WumboInstance, true);
  const { splWumboProgram } = usePrograms();

  async function exec(twitterHandle: string) {
    let result;
    try {
      setCreating(true);
      const claimedKey = await getTwitterClaimedTokenRefKey(connection, twitterHandle);
      const unclaimedKey = await getTwitterUnclaimedTokenRefKey(twitterHandle)

      const twitterName = await getTwitterRegistryKey(twitterHandle, await getTld());
      const owner = (await getTwitterRegistry(connection, twitterHandle, await getTld())).owner;
      const claimedAccount = (await cache.search(claimedKey, undefined, true))?.account;
      const unclaimedAccount = (await cache.search(unclaimedKey, undefined, true))?.account;
      if (!claimedAccount && !unclaimedAccount) {
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
        const { tokenRef } = await splWumboProgram!.createSocialToken(args);
        result = {
          tokenRef,
          owner
        }
      } else if (claimedAccount) {
        result = {
          tokenRef: claimedKey,
          owner
        }
      } else {
        const creator = TokenRef(unclaimedKey, unclaimedAccount!);
        result = {
          tokenRef: creator!.publicKey,
          owner
        };

        if (!creator.isClaimed) {
          await splWumboProgram!.claimSocialToken({
            owner,
            tokenRef: unclaimedKey
          })
        }
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
