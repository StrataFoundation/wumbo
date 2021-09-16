import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useConnection } from "@oyster/common";
import { claimPath, routes } from "@/constants/routes";
import {
  WUMBO_INSTANCE_KEY,
  getTwitterRegistryKey,
  getTld,
  useWallet,
  Button,
  Spinner,
  useQuery,
  useClaimLink,
  usePrograms,
  useAccountFetchCache,
  TokenRef,
  useReverseTwitter
} from "wumbo-common";
import { useAsyncCallback } from "react-async-hook";
import { useClaimFlow } from "@/utils/claim";

export default React.memo(() => {
  const history = useHistory();
  const { splWumboProgram } = usePrograms();
  const query = useQuery();
  const { publicKey } = useWallet();
  const { handle: ownerTwitterHandle } = useReverseTwitter(publicKey || undefined);

  const createCreator = async () => {
    const handle = query.get("name")!;

    const { tokenBonding } = await splWumboProgram!.createSocialToken({
      wumbo: WUMBO_INSTANCE_KEY,
      tokenName: handle,
      name: await getTwitterRegistryKey(handle, await getTld()),
      nameParent: await getTld()
    });
    history.push(
      routes.trade.path.replace(":tokenBondingKey", tokenBonding.toBase58()) +
        `?name=${query.get("name")!}`
    );
  };
  const { execute, loading: creationLoading, error } = useAsyncCallback(createCreator);
  if (error) { // TODO: Actual error handling
    console.error(error);
  }
  const { claim, loading } = useClaimFlow(query.get("name"));
  
  return (
    <div className="flex flex-grow flex-col">
      <Button block color="primary" size="lg" onClick={execute} disabled={creationLoading}>
        {creationLoading && (
          <div className="mr-4">
            <Spinner size="sm" />
          </div>
        )}
        Create Token
      </Button>
      {(!ownerTwitterHandle || ownerTwitterHandle == query.get("name")) &&
        <>
          <div className="text-center text-bold text-lg mt-2 text-gray-500 mb-2">or</div>
          <Button
            disabled={loading}
            block
            color="twitterBlue"
            size="lg"
            onClick={claim}
          >
            {loading && (
              <div className="mr-4">
                <Spinner size="sm" />
              </div>
            )}
            {!loading && "This is me, Claim!"}
            {loading && "Claiming"}
          </Button>
        </>
      }
    </div>
  );
});
