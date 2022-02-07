import { Button, Text, VStack } from "@chakra-ui/react";
import { useConfig } from "../hooks";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Confirmation } from "../Confirmation";
import { sample } from "../utils";

export const MintConfirmation = ({
  handle,
  buyLink,
}: {
  handle: string;
  buyLink: string;
}) => {
  const config = useConfig();
  const tweets = config.tweets.mint;

  return (
    <Confirmation
      tweet={sample(tweets!)?.replace("{handle}", handle)}
      bottomText={`Let @${handle} know that you created a token for them!`}
    >
      <VStack spacing={4} w="full" align="left">
        <Text>You created a token for @{handle}!</Text>
        <Button
          w="full"
          variant="outline"
          colorScheme="indigo"
          as={RouterLink}
          to={buyLink}
        >
          Trade
        </Button>
      </VStack>
    </Confirmation>
  );
};
