import React from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  HStack,
  VStack,
  StackDivider,
  Link,
} from "@chakra-ui/react";
import { RiTwitterFill, RiDiscordFill } from "react-icons/ri";
import { LandingLayout } from "./";

export const Footer: React.FC = () => (
  <Box bg="indigo.900">
    <LandingLayout>
      <Flex
        align="center"
        justify={{ base: "center", md: "space-around", xl: "space-between" }}
        direction="column"
        wrap="nowrap"
        px={8}
        my={12}
      >
        <VStack spacing={6}>
          <HStack spacing={4}>
            <Link href="https://twitter.com/TeamWumbo" isExternal>
              <Icon
                color="white"
                _hover={{ color: "indigo.400" }}
                as={RiTwitterFill}
                w={{ base: "30px", md: "40px" }}
                h={{ base: "30px", md: "40px" }}
              />
            </Link>
            <Link href="https://t.co/RjeLCbTmuv" isExternal>
              <Icon
                color="white"
                _hover={{ color: "indigo.400" }}
                as={RiDiscordFill}
                w={{ base: "30px", md: "40px" }}
                h={{ base: "30px", md: "40px" }}
              />
            </Link>
          </HStack>
          <HStack divider={<StackDivider />} spacing={4} color="white">
            <Flex align="center">
              {/* <Icon as={WumboIcon} w={7} h={7} /> */}
              <Text fontSize="sm" ml={3}>
                Wum.bo
              </Text>
            </Flex>
            <Text fontSize="sm">Copyright 2021</Text>
          </HStack>
        </VStack>
      </Flex>
    </LandingLayout>
  </Box>
);
