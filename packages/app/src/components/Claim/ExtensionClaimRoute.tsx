import React from "react";
import { Center, Text, Alert, AlertIcon } from "@chakra-ui/react";
import { useQuery, Spinner } from "wumbo-common";

export const ExtensionClaimRoute = React.memo(() => {
  const query = useQuery();
  const code = query.get("code");

  if (!code) {
    return (
      <Alert status="error">
        <AlertIcon />
        No authorization code
      </Alert>
    );
  }

  return (
    <Center flexDir="column" p={4}>
      <Spinner />
      <Text>Claiming your twitter handle...</Text>
    </Center>
  );
});
