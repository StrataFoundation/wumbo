import React from "react";
import { Flex, Center, Text, Button } from "@chakra-ui/react";
import { Header } from "./common/Header";
import { useModal } from "../../../contexts";

export const Home = () => {
  const { showModal } = useModal();

  return (
    <Flex
      flexDirection="column"
      w="full"
      h="100vh"
      bg="linear-gradient(147deg, rgba(0, 0, 0, 0.28) 15%, rgba(0, 0, 0, 0.32) 129%),
      linear-gradient(56deg, #2323ff -25%, #4f51ff 20%, #a53ef4 84%)"
      paddingX={14}
      paddingY={8}
    >
      <Header />
      <Flex h="full" color="white">
        <Center position="relative">
          <div>
            <Text fontSize="7xl" marginBottom={4}>
              Like. Share. Grow.
            </Text>
            <Flex flexDirection="column" mb={9} w={7 / 12}>
              <Text fontSize="md">
                Wum.bo is a platform that brings Creator Coins directly to the
                networks (twitter, twitch, reddit..etc) where creators interact
                with their fans. Our Creator Coins give each creator their own
                personal, customizable cryptocurrency. Interested in the
                beta?&nbsp;
              </Text>
              <Text as="u">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://teamwumbo.medium.com/wum-bo-beta-is-out-now-8d41d9a9f0e6"
                  className="underline"
                >
                  Learn More...
                </a>
              </Text>
            </Flex>
            <Button
              colorScheme="green"
              onClick={() => showModal("BetaDownload")}
            >
              Download Extension
            </Button>
          </div>
        </Center>
      </Flex>
    </Flex>
  );
};
