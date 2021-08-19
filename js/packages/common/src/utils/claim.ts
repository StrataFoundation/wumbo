import { useState } from "react";
import { CreateSocialTokenResult, TokenRef, Wumbo, WumboInstance } from "@wum.bo/spl-wumbo";
import { useAsyncCallback } from "react-async-hook";
import {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  useConnection,
} from "@oyster/common";
import { useWallet } from "../contexts/walletContext";
import {
  createTestTld,
  claimTwitterTransactionInstructions,
  postTwitterRegistrarRequest,
  getTld,
} from "./twitter";
import { useAccount } from "./account";
import {
  SPL_NAME_SERVICE_PROGRAM_ID,
  TOKEN_BONDING_PROGRAM_ID,
  WUMBO_INSTANCE_KEY,
  WUMBO_PROGRAM_ID,
} from "../constants/globals";
import { getWumbo } from "../constants/wumbo";

interface ClaimTransactionState {
  awaitingApproval: boolean;
  claiming: boolean;
  error: Error | undefined;
  claim: (twitterHandle: string) => Promise<void>;
}
export function useClaim({
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
    if (adapter) {
      try {
        await createTestTld(connection, adapter);
        const instructions = await claimTwitterTransactionInstructions(connection, {
          owner: adapter.publicKey!,
          twitterHandle,
        });
        if (instructions) {
          setClaiming(true);
          await postTwitterRegistrarRequest(
            connection,
            instructions,
            adapter,
            code!,
            redirectUri!,
            twitterHandle
          );
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
    claim: execute,
  };
}

interface CreateState {
  awaitingApproval: boolean;
  creating: boolean;
  error: Error | undefined;
  create: (twitterHandle: string) => Promise<CreateSocialTokenResult>;
}
export function useCreateCoin(): CreateState {
  const connection = useConnection();
  const { adapter } = useWallet();
  const [creating, setCreating] = useState<boolean>(false);
  const { info: wumboInstance } = useAccount(WUMBO_INSTANCE_KEY, WumboInstance.fromAccount);

  async function exec(twitterHandle: string) {
    let result;
    try {
      setCreating(true);
      const wumbo = await getWumbo();
      const key =
        (await wumbo.getTwitterClaimedTokenRefKey(connection, twitterHandle)) ||
        (await wumbo.getTwitterUnclaimedTokenRefKey(twitterHandle));
      const account = await connection.getAccountInfo(key);
      if (!account) {
        console.log("Creator does not exist, creating");
        result = await Wumbo.createWumboSocialToken(connection, {
          splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
          splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
          splTokenProgramId: TOKEN_PROGRAM_ID,
          splWumboProgramId: WUMBO_PROGRAM_ID,
          splNameServicePogramId: SPL_NAME_SERVICE_PROGRAM_ID,
          wumboInstance: WUMBO_INSTANCE_KEY,
          payer: adapter!,
          baseMint: wumboInstance!.wumboMint,
          name: twitterHandle,
          founderRewardsPercentage: 5.5,
          nameParent: await getTld(),
        });
      } else {
        const creator = TokenRef.fromAccount(key, account);
        result = {
          tokenRefKey: creator.publicKey,
          tokenBondingKey: creator.tokenBonding,
          ownerKey: adapter?.publicKey!,
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
