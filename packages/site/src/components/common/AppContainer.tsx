import React from "react";
import { Flex, Center } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";

export default React.memo(({ children = null as any }) => {
  return (
    <Flex h="100vh" flexDirection="column" fontSize="md" bg="white">
      <Header gradient={false} size="sm" />

      <Center flexGrow={1} bg="gray.300" paddingY={5}>
        <Center bg="white" shadow="xl" rounded="lg" overflow="hidden" w="420px">
          {children}
        </Center>
      </Center>

      <Center bg="gray.300">
        <Footer logoColor="black" />
      </Center>
    </Flex>
  );
});
