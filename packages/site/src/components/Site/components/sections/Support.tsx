import React from "react";
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { LandingLayout } from "../layouts/LandingLayout";

interface ISupportItemProps {
  image: string;
  supported?: boolean;
}

const SupportItem: React.FC<ISupportItemProps> = ({
  image,
  supported = false,
}) => (
  <VStack opacity={supported ? "1" : "0.5"}>
    <Box
      padding={4}
      border="1px"
      rounded="md"
      borderColor={supported ? "gray.400" : "gray.200"}
      bg={supported ? "transparent" : "gray.200"}
    >
      <Image
        src={image}
        w={{ base: "45px", md: "90px" }}
        h={{ base: "45px", md: "90px" }}
      />
    </Box>
    {!supported && <Text as="em">{!supported && "Coming Soon"}</Text>}
  </VStack>
);

export const Support: React.FC = () => (
  <LandingLayout>
    <Flex
      align="center"
      justify={{ base: "center", md: "space-around", xl: "space-between" }}
      direction={{ base: "column-reverse", md: "row" }}
      wrap="nowrap"
      px={8}
      my={12}
    >
      <VStack
        spacing={6}
        w="full"
        align={["center", "center", "flex-start", "flex-start"]}
      >
        <Heading
          as="h1"
          size="md"
          fontWeight="bold"
          textAlign={["center", "center", "left", "left"]}
        >
          Browsers We're On
        </Heading>
        <HStack alignItems="start">
          <SupportItem
            image={process.env.PUBLIC_URL + "chrome.png"}
            supported
          />
          <SupportItem image={process.env.PUBLIC_URL + "firefox.png"} />
        </HStack>
        <Heading
          as="h1"
          size="md"
          fontWeight="bold"
          textAlign={["center", "center", "left", "left"]}
        >
          Social Networks We're on
        </Heading>
        <HStack alignItems="start">
          <SupportItem
            image={process.env.PUBLIC_URL + "twitter.png"}
            supported
          />
          <SupportItem image={process.env.PUBLIC_URL + "twitch.png"} />
          <SupportItem image={process.env.PUBLIC_URL + "youtube.png"} />
          <SupportItem image={process.env.PUBLIC_URL + "reddit.png"} />
        </HStack>
      </VStack>
    </Flex>
  </LandingLayout>
);
