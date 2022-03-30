import { routes, swapPath } from "@/constants/routes";
import { useClaimFlow } from "@/utils/claim";
import { Box, Button, Link, Text } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  useErrorHandler,
  useProvider,
  useStrataSdks,
} from "@strata-foundation/react";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import React, { useMemo } from "react";
import { useAsyncCallback } from "react-async-hook";
import { useHistory } from "react-router-dom";
import {
  APP_URL,
  getTwitterRegistryKey,
  getTwitterTld,
  useConfig,
  useQuery,
  useReverseTwitter,
  useUserInfo,
} from "wumbo-common";

function toPercent(u32: number) {
  return (u32 / 4294967295) * 100;
}
export default React.memo(() => {
  const history = useHistory();
  const { tokenCollectiveSdk, tokenBondingSdk } = useStrataSdks();
  const query = useQuery();
  const { awaitingApproval } = useProvider();
  const { publicKey } = useWallet();
  const wumboConfig = useConfig();
  const { handle: ownerTwitterHandle, error: reverseTwitterError } =
    useReverseTwitter(publicKey || undefined);
  const { userInfo, loading: loading2 } = useUserInfo(query.get("name")!);
  let goLiveDate = new Date(0);
  // Can uncomment when creating with wumbo.
  // goLiveDate.setUTCSeconds(1642518000); // 9am CST on January 18th
  goLiveDate.setUTCSeconds(wumboConfig.goLiveUnixTime); // 9am CST on January 19th
  const isLive = new Date() > goLiveDate;

  const createCreator = async () => {
    const handle = query.get("name")!;

    const collectiveAcct = (await tokenCollectiveSdk?.getCollective(
      SplTokenCollective.OPEN_COLLECTIVE_ID
    ))!;
    const config = collectiveAcct.config.unclaimedTokenBondingSettings as any;

    // After the launch, use the normal logic
    // TODO: We can rm all of this logic after launch
    if (new Date() > goLiveDate) {
      goLiveDate = new Date(new Date().valueOf() - 10000); // 10 secs ago
    }

    const { tokenBonding, mint } = await tokenCollectiveSdk!.createSocialToken({
      metadata: {
        name: handle,
        symbol: "UNCLAIMED",
      },
      name: await getTwitterRegistryKey(handle, await getTwitterTld()),
      nameParent: await getTwitterTld(),
      tokenBondingParams: {
        goLiveDate,
        buyBaseRoyaltyPercentage: toPercent(config.minBuyBaseRoyaltyPercentage),
        sellBaseRoyaltyPercentage: toPercent(
          config.minSellBaseRoyaltyPercentage
        ),
        buyTargetRoyaltyPercentage: toPercent(
          config.minBuyTargetRoyaltyPercentage
        ),
        sellTargetRoyaltyPercentage: toPercent(
          config.minSellTargetRoyaltyPercentage
        ),
      },
    });
    const buyLink =
      swapPath(
        tokenBonding!,
        SplTokenCollective.OPEN_COLLECTIVE_MINT_ID,
        mint
      ) + `?name=${query.get("name")!}`;
    history.push(
      routes.mintConfirmation.path +
        `?handle=${query.get("name")!}&buyLink=${buyLink}`
    );
  };

  const {
    execute,
    loading: creationLoading,
    error,
  } = useAsyncCallback(createCreator);
  const {
    link,
    linkLoading,
    error: claimError,
  } = useClaimFlow(query.get("name"));
  const { handleErrors } = useErrorHandler();
  handleErrors(reverseTwitterError, error, claimError);
  const showCreate = useMemo(
    () => !userInfo && !loading2,
    [userInfo, loading2]
  );

  const or = (
    <Box d="flex" justifyContent="center">
      <Text fontSize="lg" color="gray.500">
        Or
      </Text>
    </Box>
  );
  return (
    <>
      {showCreate && (
        <Button
          disabled={!isLive || creationLoading}
          title={
            !isLive
              ? `Minting tokens for others enabled on ${goLiveDate.toLocaleString()}`
              : undefined
          }
          w="full"
          size="md"
          colorScheme="indigo"
          onClick={execute}
          isLoading={creationLoading}
          loadingText={
            awaitingApproval ? "Awaiting Approval" : "Creating Token"
          }
        >
          Create a Token for {query.get("name")}
        </Button>
      )}
      {(!ownerTwitterHandle || ownerTwitterHandle == query.get("name")) && (
        <>
          {showCreate && or}
          <Button
            as={Link}
            isExternal
            href={APP_URL + "/claim?handle=" + query.get("name")}
            w="full"
            size="md"
            colorScheme="twitter"
          >
            This is me, Claim and Create my Token
          </Button>
        </>
      )}
      {showCreate && or}
      <Button
        w="full"
        size="md"
        colorScheme="twitter"
        onClick={link}
        isLoading={linkLoading}
        loadingText={awaitingApproval ? "Awaiting Approval" : "Linking"}
      >
        Link my Wallet, but don't claim Token
      </Button>
    </>
  );
});
