import React from "react";
import { Image, Flex, VStack, Heading, Text, Button } from "@chakra-ui/react";
import { DownloadButton } from "../../../common/DownloadButton";
import ChromeStoreScreen from "../../../../assets/images/chromestore.png";

export const Claim4: React.FC = () => (
  <VStack spacing={8} align="left">
    <div>
      <Text fontSize="sm" fontWeight="bold" color="indigo.600">
        Wum.bo
      </Text>
      <Heading as="h1" size="xl">
        Claim successful!
      </Heading>
    </div>
    <VStack spacing={6} color="gray.600">
      <Text fontSize="md">
        Wum.bo is a platform built on top of Solana that introduces a new
        economy, allowing fans to be talent scouts and creators to fund their
        endeavors.
      </Text>
      <Text fontSize="md">
        Wum.bo uses Social Tokens to allow fans to back their favorite artists
        and share in the up side, helping them fund new albums, games, and other
        ventures. We are enhancing existing social networks by giving users a
        new way to support each other.
      </Text>
    </VStack>
    <Image src={ChromeStoreScreen} />
    <Flex w="full" justifyContent="center">
      <VStack spacing={6} py={4} maxW="412px" w="full">
        <DownloadButton isFullWidth colorScheme="indigo" />
        <Button
          isFullWidth
          colorScheme="indigo"
          variant="outline"
          onClick={() => {
            // TODO: where do I go
            console.log("learn more");
          }}
        >
          Learn More
        </Button>
      </VStack>
    </Flex>
  </VStack>
);
