import React, { FC, useCallback } from "react";
import { CSSReset } from "@chakra-ui/css-reset";
import {
  AccountProvider,
  ErrorHandlerProvider,
  StrataSdksProvider,
  ThemeProvider,
} from "@strata-foundation/react";

export const Providers: FC = ({ children }) => {
  const onError = useCallback((error: Error) => {
    console.error(error);
    if (
      error.message?.includes(
        "Attempt to debit an account but found no record of a prior credit."
      )
    ) {
      error = new Error("Not enough SOL to perform this action");
    }

    const code = (error.message?.match("custom program error: (.*)") || [])[1];
    if (code == "0x1") {
      error = new Error("Insufficient balance.");
    } else if (code === "0x0") {
      error = new Error("Blockhash expired. Please retry");
    }
  }, []);

  return (
    <ThemeProvider>
      <CSSReset />
      <ErrorHandlerProvider onError={onError}>
        <StrataSdksProvider>
          <AccountProvider commitment="confirmed">{children}</AccountProvider>
        </StrataSdksProvider>
      </ErrorHandlerProvider>
    </ThemeProvider>
  );
};
