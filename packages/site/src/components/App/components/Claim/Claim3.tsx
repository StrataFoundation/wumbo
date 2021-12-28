import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Flex, VStack, Heading, Text, Button } from "@chakra-ui/react";
import { claimPath } from "../../../../constants/routes";

export interface IClaim3Props {
  handle: string;
  authCode: string | null | undefined;
}

export const Claim3: React.FC<IClaim3Props> = ({ handle, authCode }) => {
  const history = useHistory();
  const { connected } = useWallet();

  useEffect(() => {
    if (!connected) {
      history.push(claimPath({ step: 2, authCode, handle }));
    }
  }, [connected, history, claimPath]);

  useEffect(() => {
    if (connected && authCode) {
      history.push(claimPath({ step: 4, authCode, handle }));
    }
  }, [connected, history, claimPath, authCode]);

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
            onClick={() => console.log("twitter auth flow")}
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
