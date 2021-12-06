import React from "react";
import { Center, HStack, Icon, Text, Button } from "@chakra-ui/react";
import { WumboIcon } from "wumbo-common";
import { useModal } from "../../../../contexts";

export interface IHeaderProps {
  color?: "white";
}

export const Header = ({ color = "white" }: IHeaderProps) => {
  const { showModal } = useModal();

  return (
    <Center
      w="full"
      justifyContent="space-between"
      alignItems="center"
      color={color}
    >
      <HStack spacing={4}>
        <Icon as={WumboIcon} w={10} h={10} />
        <Text fontSize="xl">Wum.bo</Text>
      </HStack>
      <HStack spacing={6}>
        <Button
          size="md"
          variant="ghost"
          _hover={{ color: "indigo.500", bg: "white" }}
        >
          Read Whitepaper
        </Button>
        <Button
          size="md"
          variant="outline"
          colorScheme="gray"
          _hover={{ color: "indigo.500", bg: "white" }}
          onClick={() => showModal("BetaDownload")}
        >
          Download Extension
        </Button>
      </HStack>
    </Center>
  );
};
