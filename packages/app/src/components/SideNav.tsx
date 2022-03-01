import React from "react";
import { Flex, HStack, VStack, Icon, Text, Button } from "@chakra-ui/react";
import { RiHome2Fill } from "react-icons/ri";
import { WumboRankIcon } from "wumbo-common";

export const SideNav = () => (
  <Flex
    flexDirection="column"
    w="260px"
    h="full"
    justifyContent="start"
    alignItems="start"
    bg="gray.200"
  >
    <HStack
      w="full"
      spacing={4}
      paddingX={4}
      paddingY={3}
      color="white"
      bg="linear-gradient(147deg, rgba(0, 0, 0, 0.28) 15%, rgba(0, 0, 0, 0.32) 129%),
      linear-gradient(56deg, #2323ff -25%, #4f51ff 20%, #a53ef4 84%)"
    >
      <Icon as={WumboRankIcon} w={10} h={10} />
      <Text fontSize="xl">Wum.bo</Text>
    </HStack>
    <VStack w="full" spacing={4} padding={4} alignItems="start">
      <Button
        w="full"
        variant="ghost"
        colorScheme="indigo"
        justifyContent="start"
        _hover={{ bg: "none", color: "indigo.800" }}
        leftIcon={<Icon as={RiHome2Fill} w={5} h={5} />}
      >
        Dashboard
      </Button>
    </VStack>
  </Flex>
);
