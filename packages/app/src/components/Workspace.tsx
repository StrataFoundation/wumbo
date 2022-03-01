import React from "react";
import { Flex } from "@chakra-ui/react";

export const Workspace: React.FC = ({ children }) => (
  <Flex flexDirection="column" flexGrow={1} h="full">
    {children}
  </Flex>
);
