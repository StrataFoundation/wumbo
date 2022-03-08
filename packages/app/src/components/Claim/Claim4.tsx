import {
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { RiTwitterFill } from "react-icons/ri";
import { sample, useConfig } from "wumbo-common";
import ChromeStoreScreen from "../../assets/images/chromestore.png";
import { DownloadButton } from "../common/DownloadButton";

export const Claim4 = ({ handle }: { handle: string }) => {
  const config = useConfig();
  const tweet = sample(config.tweets.claim)?.replace("{handle}", handle);
  return (
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
          and share in the up side, helping them fund new albums, games, and
          other ventures. We are enhancing existing social networks by giving
          users a new way to support each other.
        </Text>
      </VStack>
      <Image src={ChromeStoreScreen} />
      <Flex w="full" justifyContent="center">
        <VStack spacing={6} py={4} maxW="412px" w="full">
          {tweet && (
            <Button
              isFullWidth
              colorScheme="twitter"
              leftIcon={<Icon as={RiTwitterFill} />}
              as={Link}
              isExternal
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                tweet
              )}`}
            >
              Tweet
            </Button>
          )}
          <DownloadButton isFullWidth colorScheme="indigo" />
        </VStack>
      </Flex>
    </VStack>
  );
};
