import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useConnection } from "@oyster/common";
import { Wumbo } from "@wum.bo/spl-wumbo";
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
  TokenRef
} from "wumbo-common";
import { useAsyncCallback } from "react-async-hook";

export default React.memo(() => {
  const history = useHistory();
  const { adapter } = useWallet();
  const connection = useConnection();
  const { splWumboProgram } = usePrograms();
  const query = useQuery();
  const cache = useAccountFetchCache()


  const createCreator = async () => {
    const handle = query.get("name")!;

    const { tokenRef, tokenBonding } = await splWumboProgram!.createSocialToken({
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
  const redirectUri = `http://localhost:3000/claim?name=${query.get("name")}`;
  const claim = useClaimLink({ redirectUri });
  const [claimWindow, setClaimWindow] = useState<Window>();

  chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.type == "CLAIM") {
      claimWindow?.close();
      history.push(claimPath({ ...msg.data, redirectUri }));
    }

    sendResponse();
    return true;
  });

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
      <div className="text-center text-bold text-lg mt-2 text-gray-500 mb-2">or</div>
      <Button
        block
        color="twitterBlue"
        size="lg"
        onClick={() => setClaimWindow(claim() || undefined)}
      >
        This is me, Claim!
      </Button>
    </div>
  );
});
