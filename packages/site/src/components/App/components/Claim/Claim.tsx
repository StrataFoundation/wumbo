import React, { useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useQuery } from "wumbo-common";
import { Alert, AlertIcon, Flex } from "@chakra-ui/react";
import { claimPath } from "../../../../constants/routes";
import { Claim1 } from "./Claim1";
import { Claim2 } from "./Claim2";
import { Claim3 } from "./Claim3";
import { Claim4 } from "./Claim4";

export const ClaimRoute = React.memo(() => {
  const history = useHistory();
  const query = useQuery();
  const step = query.get("step") || 1;
  const handle = query.get("handle") || undefined;
  const code = query.get("code") || undefined;

  const incrementStep = useCallback(() => {
    if (handle) {
      history.push(claimPath({ step: `${+step + 1}`, handle, code }));
    }
  }, [step, handle, code, history]);

  const decrementStep = useCallback(() => {
    if (handle) {
      history.push(claimPath({ step: `${+step - 1}`, handle, code }));
    }
  }, [step, handle, code, history]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  if (!step || !handle) {
    return (
      <Alert status="error" rounded="lg">
        <AlertIcon />
        {!step ? "Claim Step Undeterminable." : "No Handle Provided."}
      </Alert>
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      w="full"
      maxW={{ md: "760px" }}
      m="0 auto"
      p={10}
    >
      {step === "1" && (
        <Claim1
          handle={handle}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      )}
      {step === "2" && (
        <Claim2
          handle={handle}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      )}
      {step === "3" && (
        <Claim3
          handle={handle}
          code={code}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      )}
      {step === "4" && <Claim4 />}
    </Flex>
  );
});
