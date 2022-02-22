import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useClaimLink, useCreateOrClaimCoin } from "wumbo-common";

export interface IClaim3Props {
  handle: string;
  code?: string;
  incrementStep: () => void;
  decrementStep: () => void;
}

export const Claim3 = React.memo<IClaim3Props>(
  ({ handle, code, incrementStep, decrementStep }) => {
    const history = useHistory();
    const [attemptedClaim, setAttemptedClaim] = useState<boolean>(false);
    const [internalError, setInternalError] = useState<undefined | Error>();
    const [isClaiming, setIsClaiming] = useState<boolean>(false);
    const { connected } = useWallet();
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
      (async () => {
        if (connected && code && !attemptedClaim) {
          try {
            setAttemptedClaim(true);
            setIsClaiming(true);
            await create({
              redirectUri,
              code,
              twitterHandle: handle,
            });
            incrementStep();
          } catch (e) {
            setInternalError(e as Error);
          } finally {
            setIsClaiming(false);
          }
        }
      })();
    }, [
      connected,
      code,
      create,
      attemptedClaim,
      setIsClaiming,
      setAttemptedClaim,
      setInternalError,
    ]);

    useEffect(() => {
      if (createCoinError) {
        setInternalError(createCoinError);
      }
    }, [createCoinError, setInternalError]);

    const hasError = createCoinError || internalError;
    const loggedInAsWrongUser =
      hasError &&
      ["Screen", "name", "does", "not", "match"].every(
        (match) =>
          internalError?.message && internalError.message.includes(match)
      );

    return (
      <VStack w="full" spacing={8} align="left">
        {hasError && (
          <Alert status="error" rounded="lg">
            <AlertIcon />
            {loggedInAsWrongUser &&
              `Make sure you're logged into twitter as ${handle}. ${internalError?.message}`}
            {!loggedInAsWrongUser && `${internalError?.message}`}
          </Alert>
        )}
        <div>
          <Text fontSize="sm" fontWeight="bold" color="indigo.600">
            Wum.bo
          </Text>
          <Heading as="h1" size="xl">
            Verify your Twitter account
          </Heading>
        </div>
        <Text fontSize="md">
          Almost there! In order to claim your profile on Wumbo, we'll need you
          to connect your Twitter account. The Wumbo chrome extension sits on
          top of Twitter so you can see and interact with Collectives or social
          tokens you come across.
        </Text>
        <Flex w="full" justifyContent="center">
          <VStack spacing={6} py={4} maxW="412px" w="full">
            <Button
              isFullWidth
              colorScheme="twitter"
              onClick={claim}
              isLoading={awaitingApproval || creating || isClaiming}
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
  }
);
