import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Icon,
  Text,
  HStack,
  VStack,
  StackDivider,
} from "@chakra-ui/react";
import { RiTwitterFill, RiDiscordFill } from "react-icons/ri";
import { WumboIcon } from "wumbo-common";
import { LandingLayout } from "../layouts/LandingLayout";

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
            <Link
              to={{ pathname: "https://twitter.com/TeamWumbo" }}
              target="_blank"
            >
              <Icon
                color="white"
                _hover={{ color: "indigo.400" }}
                as={RiTwitterFill}
                w={{ base: "30px", md: "40px" }}
                h={{ base: "30px", md: "40px" }}
              />
            </Link>
            <Link to={{ pathname: "https://t.co/RjeLCbTmuv" }} target="_blank">
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
              <Icon as={WumboIcon} w={7} h={7} />
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
