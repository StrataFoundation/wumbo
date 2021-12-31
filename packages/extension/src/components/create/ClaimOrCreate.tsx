import { swapPath } from "@/constants/routes";
import { useClaimFlow } from "@/utils/claim";
import { useUserInfo } from "@/utils/userState";
import { Box, Button, Text } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  useErrorHandler,
  useProvider,
  useStrataSdks
} from "@strata-foundation/react";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import React, { useMemo } from "react";
import { useAsyncCallback } from "react-async-hook";
import { useHistory } from "react-router-dom";
import {
  getTwitterRegistryKey, getTwitterTld, useQuery,
  useReverseTwitter
} from "wumbo-common";

function toPercent(u32: number) {
  return (u32 / 4294967295) * 100
}
export default React.memo(() => {
  const history = useHistory();
  const { tokenCollectiveSdk, tokenBondingSdk } = useStrataSdks();
  const query = useQuery();
  const { awaitingApproval } = useProvider();
  const { adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  const { handle: ownerTwitterHandle, error: reverseTwitterError } =
    useReverseTwitter(publicKey || undefined);
  const { userInfo, loading: loading2 } = useUserInfo(query.get("name")!);

  const createCreator = async () => {
    const handle = query.get("name")!;

    const collectiveAcct = (await tokenCollectiveSdk?.getCollective(
      SplTokenCollective.OPEN_COLLECTIVE_ID
    ))!;
    const config = collectiveAcct.config.unclaimedTokenBondingSettings as any;
    const { tokenBonding } = await tokenCollectiveSdk!.createSocialToken({
      metadata: {
        name: handle,
        symbol: "UNCLAIMED",
      },
      name: await getTwitterRegistryKey(handle, await getTwitterTld()),
      nameParent: await getTwitterTld(),
      tokenBondingParams: {
        buyBaseRoyaltyPercentage: toPercent(config.minBuyBaseRoyaltyPercentage),
        sellBaseRoyaltyPercentage: toPercent(config.minSellBaseRoyaltyPercentage),
        buyTargetRoyaltyPercentage: toPercent(config.minBuyTargetRoyaltyPercentage),
        sellTargetRoyaltyPercentage: toPercent(config.minSellTargetRoyaltyPercentage),
      },
    });
    const tokenBondingAcct = (await tokenBondingSdk!.getTokenBonding(
      tokenBonding!
    ))!;
    history.push(
      swapPath(
        tokenBonding!,
        tokenBondingAcct.baseMint,
        tokenBondingAcct.targetMint
      ) + `?name=${query.get("name")!}`
    );
  };
  const { provider } = useProvider()

  const {
    execute,
    loading: creationLoading,
    error,
  } = useAsyncCallback(createCreator);
  const { link, claim, claimLoading: loading, linkLoading, error: claimError } = useClaimFlow(query.get("name"));
  const  { handleErrors } = useErrorHandler();
  handleErrors(reverseTwitterError, error, claimError);
  const showCreate = useMemo(
    () => !userInfo && !loading2,
    [userInfo, loading2]
  );

  const or = <Box d="flex" justifyContent="center">
    <Text fontSize="lg" color="gray.500">
      Or
    </Text>
  </Box>
  return (
    <>
      {/* TODO: Uncomment when token creation is live */}
      {/* {showCreate && (
        <Button
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
          {showCreate && (
            or
          )}
          <Button
            w="full"
            size="md"
            colorScheme="twitter"
            onClick={claim}
            isLoading={loading}
            loadingText={awaitingApproval ? "Awaiting Approval" : "Claiming"}
          >
            This is me, Claim and Create my Token
          </Button>
        </>
      )} */}
      {!ownerTwitterHandle && (
        <>
            {/* TODO: Uncomment when token creation is live */}
          {/* {showCreate && (
            or
          )} */}
          <Button
            w="full"
            size="md"
            colorScheme="twitter"
            onClick={link}
            isLoading={linkLoading}
            loadingText={awaitingApproval ? "Awaiting Approval" : "Linking"}
          >
            This is me, Link my Twitter
          </Button>
        </>
      )}
    </>
  );
});
