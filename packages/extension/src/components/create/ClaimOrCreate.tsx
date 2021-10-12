import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Box, Text, Button } from "@chakra-ui/react";
import { useConnection } from "@oyster/common";
import { claimPath, routes } from "@/constants/routes";
import {
  WUMBO_INSTANCE_KEY,
  getTwitterRegistryKey,
  getTld,
  useWallet,
  useQuery,
  useClaimLink,
  usePrograms,
  useAccountFetchCache,
  TokenRef,
  useReverseTwitter,
  handleErrors,
} from "wumbo-common";
import { useAsyncCallback } from "react-async-hook";
import { useClaimFlow } from "@/utils/claim";
import { useUserInfo } from "@/utils/userState";

export default React.memo(() => {
  const history = useHistory();
  const { splWumboProgram } = usePrograms();
  const query = useQuery();
  const { publicKey, awaitingApproval } = useWallet();
  const { handle: ownerTwitterHandle, error: reverseTwitterError } =
    useReverseTwitter(publicKey || undefined);
  const { userInfo, loading: loading2 } = useUserInfo(query.get("name")!);

  const createCreator = async () => {
    const handle = query.get("name")!;

    const { tokenBonding } = await splWumboProgram!.createSocialToken({
      wumbo: WUMBO_INSTANCE_KEY,
      tokenName: handle,
      name: await getTwitterRegistryKey(handle, await getTld()),
      nameParent: await getTld(),
    });
    history.push(
      routes.trade.path.replace(":tokenBondingKey", tokenBonding.toBase58()) +
        `?name=${query.get("name")!}`
    );
  };

  const {
    execute,
    loading: creationLoading,
    error,
  } = useAsyncCallback(createCreator);
  const { claim, loading, error: claimError } = useClaimFlow(query.get("name"));
  handleErrors(reverseTwitterError, error, claimError);
  const showCreate = useMemo(() => !userInfo && !loading2, [userInfo, loading2]);
  
  return (
    <>
      { showCreate && <Button
        w="full"
        size="md"
        colorScheme="indigo"
        onClick={execute}
        isLoading={creationLoading}
        loadingText={awaitingApproval ? "Awaiting Approval" : "Creating Token"}
      >
        Create a Token for {query.get("name")}
      </Button> }
      {(!ownerTwitterHandle || ownerTwitterHandle == query.get("name")) && (
        <>
          { showCreate && <Box d="flex" justifyContent="center">
            <Text fontSize="lg" color="gray.500">
              Or
            </Text>
          </Box> }
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
