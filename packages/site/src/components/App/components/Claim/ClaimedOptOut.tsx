import { Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  useErrorHandler,
  usePrimaryClaimedTokenRef,
  useStrataSdks,
} from "@strata-foundation/react";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import React from "react";
import { useAsyncCallback } from "react-async-hook";
import { useHistory } from "react-router-dom";
import { Spinner } from "wumbo-common";
import WalletRedirect from "../Wallet/WalletRedirect";

async function optOut(
  tokenCollectiveSdk: SplTokenCollective,
  tokenRef: PublicKey
): Promise<void> {
  await tokenCollectiveSdk.optOut({
    tokenRef,
  });
}

export const ClaimedOptOutRoute: React.FC = () => {
  const history = useHistory();
  const { publicKey } = useWallet();
  const { info: tokenRef, loading } = usePrimaryClaimedTokenRef(publicKey);
  const { tokenCollectiveSdk } = useStrataSdks();
  const { execute, loading: executing, error } = useAsyncCallback(optOut);
  const { handleErrors } = useErrorHandler();
  handleErrors(error);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Flex
      direction="column"
      align="center"
      w="full"
      maxW={{ md: "760px" }}
      m="0 auto"
      p={10}
    >
      <WalletRedirect />

      <VStack w="full" spacing={12} align="left">
        <VStack w="full" spacing={8} align="left">
          <div>
            <Text fontSize="sm" fontWeight="bold" color="indigo.600">
              Wum.bo
            </Text>
            <Heading as="h1" size="xl">
              Opt Out Of Wumbo
            </Heading>
            <Text fontSize="md">
              Your token's price and stats will no longer be displayed in
              Wum.bo. Buying your token will be disabled, so no new tokens may
              be minted. People who still have your token will have the
              opportunity to sell, but potentially not at the same rate that
              they bought the token for.
            </Text>
          </div>
        </VStack>
        <VStack align="left">
          <Text fontSize="lg" fontWeight="500">
            Consider a Social Only Token
          </Text>
          <Text fontSize="md">
            Consider keeping your token, and using it only as a social
            indicator. A Wum.bo token is not necessarily the De-Facto token for
            your project. For example, the @TeamWumbo twitter uses a "Wum.bo
            Social" token with the symbol "soWUM" You can name the token for
            your project indicating it is a social token, and prefix the symbol
            so.
          </Text>
        </VStack>
        <Button
          colorScheme="red"
          onClick={() => execute(tokenCollectiveSdk!, tokenRef!.publicKey)}
          loading={executing}
          disabled={!publicKey}
        >
          {publicKey ? "Opt Out" : "Social Token not Found"}
        </Button>
      </VStack>
    </Flex>
  );
};
