import React from "react";
import { AppRoutes } from "../../../../constants/routes";
import { Alert, AlertIcon, Flex, Stack } from "@chakra-ui/react";
import { useQuery } from "wumbo-common";
import { Claim1 } from "./Claim1";

export const ClaimRoute = React.memo(() => {
  const query = useQuery();
  const step = query.get("step");
  const handle = query.get("handle");

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
            return (
              <Claim1
                onNext={() => console.log("next")}
                onCancel={() => console.log("cancel")}
                handle={handle}
              />
            );
        }
      })()}
    </Flex>
  );
});
