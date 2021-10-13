import React from "react";
import { Center, HStack, Icon, Text } from "@chakra-ui/react";
import { WumboIcon } from "wumbo-common";

export const Header = () => (
  <Center
    w="full"
    paddingX={14}
    paddingY={4}
    justifyContent="space-between"
    alignItems="center"
    color="white"
    bg="linear-gradient(147deg, rgba(0, 0, 0, 0.28) 15%, rgba(0, 0, 0, 0.32) 129%),
      linear-gradient(56deg, #2323ff -25%, #4f51ff 20%, #a53ef4 84%)"
  >
    <HStack spacing={4}>
      <Icon as={WumboIcon} w={10} h={10} />
      <Text fontSize="xl">Wum.bo</Text>
    </HStack>
  </Center>
);
