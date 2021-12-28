import React from "react";
import { Alert, AlertIcon, Flex } from "@chakra-ui/react";
import { useQuery } from "wumbo-common";
import { Claim1 } from "./Claim1";
import { Claim2 } from "./Claim2";
import { Claim3 } from "./Claim3";
import { Claim4 } from "./Claim4";

export const ClaimRoute = React.memo(() => {
  const query = useQuery();
  const step = query.get("step");
  const handle = query.get("handle");
  const authCode = query.get("authCode");

  if (!step || !handle) {
    return (
      <Alert status="error">
        <AlertIcon />
        {!step ? "Claim Step Undeterminable." : "No Handle Provided."}
      </Alert>
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      maxW={{ md: "686px" }}
      m="0 auto"
      p={10}
    >
      {(() => {
        switch (step) {
          case "1":
            return <Claim1 handle={handle} />;
          case "2":
            return <Claim2 handle={handle} authCode={authCode} />;
          case "3":
            return <Claim3 handle={handle} authCode={authCode} />;
          case "4":
            return <Claim4 />;
        }
      })()}
    </Flex>
  );
});
