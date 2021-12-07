import React from "react";
import { Flex } from "@chakra-ui/react";

export const Workspace: React.FC = ({ children }) => (
  <Flex
    flexDirection="column"
    flexGrow={1}
    h="full"
    bg="gray.100"
    overflow="hidden"
  >
    {children}
  </Flex>
);
