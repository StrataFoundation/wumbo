import React from "react";
import { Center } from "@chakra-ui/react";

export const AppContainer = React.memo(({ children = null as any }) => {
  return (
    <Center flexGrow={1}>
      <Center bg="white" shadow="xl" rounded="lg" overflow="hidden" w="420px">
        {children}
      </Center>
    </Center>
  );
});
