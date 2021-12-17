import React from "react";
import {
  Center,
  HStack,
  Icon,
  Text,
  Button,
  CenterProps,
} from "@chakra-ui/react";
import { WumboIcon } from "wumbo-common";
import { useModal } from "../../../../contexts";

export interface IHeaderProps extends CenterProps {
  color?: "white";
}

export const Header: React.FC<IHeaderProps> = ({
  color = "white",
  ...centerProps
}) => {
  const { showModal } = useModal();

  return (
    <Center
      w="full"
      justifyContent="space-between"
      alignItems="center"
      color={color}
      {...centerProps}
    >
      <HStack spacing={4}>
        <Icon as={WumboIcon} w={10} h={10} />
        <Text fontSize="xl">Wum.bo</Text>
      </HStack>
      <HStack spacing={12}>
        <Button color="white" size="md" variant="link">
          Blog
        </Button>
        <Button
          size="md"
          variant="outline"
          colorScheme="gray"
          _hover={{ color: "indigo.500", bg: "white" }}
          onClick={() => showModal("BetaDownload")}
        >
          Download Wumbo Now
        </Button>
      </HStack>
    </Center>
  );
};
