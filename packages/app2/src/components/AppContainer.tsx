import React from "react";
import { Box, Center } from "@chakra-ui/react";

export const AppContainer = React.memo(({ children = null as any }) => {
  return (
    <Box w="full" h="full" overflow="auto" paddingTop={{ sm: "18px" }}>
      <Center flexGrow={1}>
        <Center bg="white" shadow="xl" rounded="lg" w="420px">
          {children}
        </Center>
      </Center>
    </Box>
  );
});
