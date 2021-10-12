import React from "react";
import { Center, Text, Alert, AlertIcon } from "@chakra-ui/react";
import AppContainer from "../common/AppContainer";
import { useQuery, Spinner } from "wumbo-common";

export const ExtensionClaimRoute = React.memo(() => {
  const query = useQuery();
  const code = query.get("code");

  if (!code) {
    return (
      <AppContainer>
        <Alert status="error">
          <AlertIcon />
          No authorization code
        </Alert>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Center flexDir="column" p={4}>
        <Spinner />
        <Text>Claiming your twitter handle...</Text>
      </Center>
    </AppContainer>
  );
});
