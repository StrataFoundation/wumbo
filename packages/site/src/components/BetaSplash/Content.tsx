import React from "react";
import { Flex, Box, Center, Text } from "@chakra-ui/react";
import BetaButton from "./BetaButton";
import Bg from "../../assets/images/bg/beta-splash.png";

const Content: React.FC = () => (
  <Flex h="full" py={10} px={10}>
    <Center position="relative">
      <Box h="full" position="absolute" right="0" bottom="0">
        <img src={Bg} alt="bg" />
      </Box>
      <div>
        <Text fontSize="7xl" marginBottom={4}>
          Like. Share. Grow.
        </Text>
        <Flex mb={9} w={8 / 12}>
          <Text fontSize="md">
            Wum.bo is a platform that brings Creator Coins directly to the
            networks (twitter, twitch, reddit..etc) where creators interact with
            their fans. Our Creator Coins give each creator their own personal,
            customizable cryptocurrency. Interested in the beta?{" "}
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
          </Text>
        </Flex>
        <BetaButton colorScheme="green" />
      </div>
    </Center>
  </Flex>
);

export default Content;
