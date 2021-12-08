import { routes } from "@/constants/routes";
import { useClaimFlow } from "@/utils/claim";
import { useUserInfo } from "@/utils/userState";
import { Box, Button, Text } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { useAsyncCallback } from "react-async-hook";
import { useHistory } from "react-router-dom";
import {
  getTld,
  getTwitterRegistryKey,
  useQuery,
  useReverseTwitter,
} from "wumbo-common";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  useErrorHandler,
  useProvider,
  useStrataSdks,
} from "@strata-foundation/react";

export default React.memo(() => {
  const history = useHistory();
  const { tokenCollectiveSdk } = useStrataSdks();
  const query = useQuery();
  const { awaitingApproval } = useProvider();
  const { adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  const { handle: ownerTwitterHandle, error: reverseTwitterError } =
    useReverseTwitter(publicKey || undefined);
  const { userInfo, loading: loading2 } = useUserInfo(query.get("name")!);

  const createCreator = async () => {
    const handle = query.get("name")!;

    const { tokenBonding } = await tokenCollectiveSdk!.createSocialToken({
      metadata: {
        name: handle,
        symbol: "UNCLAIMED",
      },
      name: await getTwitterRegistryKey(handle, await getTld()),
      nameParent: await getTld(),
      tokenBondingParams: {
        buyBaseRoyaltyPercentage: 0,
        sellBaseRoyaltyPercentage: 0,
        buyTargetRoyaltyPercentage: 5,
        sellTargetRoyaltyPercentage: 0,
      },
    });
    history.push(
      routes.trade.path.replace(":tokenBondingKey", tokenBonding!.toBase58()) +
        `?name=${query.get("name")!}`
    );
  };

  const {
    execute,
    loading: creationLoading,
    error,
  } = useAsyncCallback(createCreator);
  const { claim, loading, error: claimError } = useClaimFlow(query.get("name"));
  const { handleErrors } = useErrorHandler();
  handleErrors(reverseTwitterError, error, claimError);
  const showCreate = useMemo(
    () => !userInfo && !loading2,
    [userInfo, loading2]
  );

  return (
    <>
      {showCreate && (
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
            <Box d="flex" justifyContent="center">
              <Text fontSize="lg" color="gray.500">
                Or
              </Text>
            </Box>
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
      )}
    </>
  );
});
