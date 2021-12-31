import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Flex, VStack, Heading, Text, Button } from "@chakra-ui/react";
import { useErrorHandler } from "@strata-foundation/react";
import { useClaimLink, useCreateOrClaimCoin } from "wumbo-common";

export interface IClaim3Props {
  handle: string;
  code?: string;
  incrementStep: () => void;
  decrementStep: () => void;
}

export const Claim3: React.FC<IClaim3Props> = ({
  handle,
  code,
  incrementStep,
  decrementStep,
}) => {
  const history = useHistory();
  const [attemptedToClaim, setAttemptedToClaim] = useState(false);
  const { connected } = useWallet();
  const { handleErrors } = useErrorHandler();
  const { claim, redirectUri } = useClaimLink({
    handle: `${handle}`,
  });

  const {
    create,
    error: createCoinError,
    creating,
    awaitingApproval,
  } = useCreateOrClaimCoin();

  useEffect(() => {
    if (!connected) {
      decrementStep();
    }
  }, [connected, decrementStep]);

  useEffect(() => {
    (async () => {
      if (connected && code && !attemptedToClaim) {
        try {
          setAttemptedToClaim(true);
          await create({
            redirectUri,
            code,
            twitterHandle: handle,
          });
        } catch (e) {
          console.log(e);
        }
      }
    })();
  }, [connected, code, create, attemptedToClaim, setAttemptedToClaim]);

  handleErrors(createCoinError);

  return (
    <VStack spacing={8} align="left">
      <div>
        <Text fontSize="sm" fontWeight="bold" color="indigo.600">
          Wum.bo
        </Text>
        <Heading as="h1" size="xl">
          Verify your Twitter account
        </Heading>
      </div>
      <Text size="md">
        Almost there! In order to claim your profile on Wumbo, we'll need you to
        connect your Twitter account. The Wumbo chrome extension sits on top of
        Twitter so you can see and interact with Collectives or social tokens
        you come across.
      </Text>
      <Flex w="full" justifyContent="center">
        <VStack spacing={6} py={4} maxW="412px" w="full">
          <Button
            isFullWidth
            colorScheme="twitter"
            onClick={claim}
            isLoading={awaitingApproval || creating}
            loadingText={awaitingApproval ? "Awaiting Approval" : "Claiming"}
          >
            Log in with Twitter
          </Button>
          <Button
            colorScheme="indigo"
            variant="link"
            onClick={() => history.push("/")}
          >
            Cancel
          </Button>
        </VStack>
      </Flex>
    </VStack>
  );
};
