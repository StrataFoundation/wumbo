import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useConnection } from "@oyster/common";
import { WumboInstance, Wumbo } from "@wum.bo/spl-wumbo";
import { claimPath, routes } from "@/constants/routes";
import {
  WUMBO_INSTANCE_KEY,
  WUMBO_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TOKEN_BONDING_PROGRAM_ID,
  SPL_NAME_SERVICE_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  useAccount,
  getTld,
  useWallet,
  Button,
  Spinner,
  useQuery,
  useClaimLink,
} from "wumbo-common";
import { useAsyncCallback } from "react-async-hook";

export default React.memo(() => {
  const history = useHistory();
  const { walletAdapter } = useWallet();
  const connection = useConnection();
  const { info: wumboInstance } = useAccount(WUMBO_INSTANCE_KEY, WumboInstance.fromAccount);
  const query = useQuery();

  const createCreator = async () => {
    const { tokenBondingKey } = await Wumbo.createWumboSocialToken(connection, {
      splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
      splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      splTokenProgramId: TOKEN_PROGRAM_ID,
      splWumboProgramId: WUMBO_PROGRAM_ID,
      splNameServicePogramId: SPL_NAME_SERVICE_PROGRAM_ID,
      wumboInstance: WUMBO_INSTANCE_KEY,
      payer: walletAdapter!,
      baseMint: wumboInstance!.wumboMint,
      name: query.get("name")!,
      founderRewardsPercentage: 5.5,
      nameParent: await getTld(),
    });
    history.push(
      routes.trade.path.replace(":tokenBondingKey", tokenBondingKey.toBase58()) +
        `?name=${query.get("name")!}`
    );
  };
  const { execute, loading: creationLoading } = useAsyncCallback(createCreator);
  const redirectUri = `http://localhost:3000/claim?name=${query.get("name")}`;
  const claim = useClaimLink({ redirectUri });
  const [claimWindow, setClaimWindow] = useState<Window>();

  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.type == "CLAIM") {
      claimWindow?.close();
      history.push(claimPath({ ...msg.data, redirectUri }));
    }

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
