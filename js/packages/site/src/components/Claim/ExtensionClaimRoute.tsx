import React from "react";
import AppContainer from "../common/AppContainer";
import {
  Alert,
  useQuery,
  Spinner,
} from "wumbo-common";
import { Center, Text } from "@chakra-ui/react";

export const ExtensionClaimRoute = React.memo(() => {
  const query = useQuery();
  const code = query.get("code");
  
  if (!code) {
    return  <AppContainer>
      <Alert message="No authorization code" type="error" />
    </AppContainer>
  }

  return (
    <AppContainer>
      <Center flexDir="column" p={4}>
        <Spinner />
        <Text>Claiming your twitter handle...</Text>
      </Center>
    </AppContainer>
  )
});