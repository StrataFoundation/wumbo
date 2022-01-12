import React from "react";
import { Center, HStack, Icon, Text } from "@chakra-ui/react";
import { WumboIcon } from "wumbo-common";

export const Header: React.FC = () => (
  <Center
    w="full"
    paddingX={14}
    paddingY={4}
    justifyContent="space-between"
    alignItems="center"
    color="white"
    bg="linear-gradient(272.23deg, #5D34A9 -0.32%, #413BB1 93.88%), #FFFFFF;"
  >
    <HStack spacing={4}>
      <Icon as={WumboIcon} w={10} h={10} />
      <Text fontSize="xl">Wum.bo</Text>
    </HStack>
  </Center>
);
