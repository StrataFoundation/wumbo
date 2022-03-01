import React, { FC, useCallback } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import {
  extendTheme,
  ChakraProvider,
  theme as chakraTheme,
} from "@chakra-ui/react";
import {
  AccountProvider,
  ErrorHandlerProvider,
  StrataSdksProvider,
} from "@strata-foundation/react";
import { DEFAULT_ENDPOINT } from "@/constants";

export const theme = extendTheme({
  shadows: {
    outline: "none",
  },
  components: { Button: { baseStyle: { _focus: { boxShadow: "none" } } } },
  fonts: {
    ...chakraTheme.fonts,
    body: `Avenir,Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
    heading: `Avenir,Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
  },
  colors: {
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
    green: {
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B",
    },
    indigo: {
      50: "#E0E7FF",
      100: "#C7D2FE",
      200: "#A5B4FC",
      300: "#818CF8",
      400: "#6366F1",
      500: "#4F46E5",
      600: "#4338CA",
      700: "#3730A3",
      800: "#312E81",
      900: "#23215e",
    },
  },
});

const ThemeProvider: FC = ({ children }) => (
  <ChakraProvider resetCSS theme={theme}>
    {children}
  </ChakraProvider>
);

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
      <ErrorHandlerProvider onError={onError}>
        <ConnectionProvider endpoint={DEFAULT_ENDPOINT}>
          <StrataSdksProvider>
            <AccountProvider commitment="confirmed">{children}</AccountProvider>
          </StrataSdksProvider>
        </ConnectionProvider>
      </ErrorHandlerProvider>
    </ThemeProvider>
  );
};
