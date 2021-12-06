import React, { useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  WalletProvider,
  WALLET_PROVIDERS,
  EndpointSetter,
  wumboApi,
  ThemeProvider,
  Notification,
} from "wumbo-common";
import { AccountProvider, SolPriceProvider, ErrorHandlerProvider } from "@strata-foundation/react";
import { ApolloProvider } from "@apollo/client";
import { ConnectionProvider, AccountsProvider } from "@oyster/common";

export const ContextProviders: React.FC = ({ children }) => {
  const wallets = useMemo(() => WALLET_PROVIDERS, []);

  const onError = useCallback(
    (error: Error) => {
      console.error(error);
      if (
        error.message?.includes(
          "Attempt to debit an account but found no record of a prior credit."
        )
      ) {
        error = new Error("Not enough SOL to perform this action");
      }

      const code = (error.message?.match("custom program error: (.*)") ||
        [])[1];
      if (code == "0x1") {
        error = new Error("Insufficient balance.");
      } else if (code == "0x136") {
        error = new Error("Purchased more than the cap of 100 bWUM");
      } else if (code === "0x0") {
        error = new Error("Blockhash expired. Please retry");
      }

      toast.custom((t) => (
        <Notification
          type="error"
          show={t.visible}
          heading={error.name}
          // @ts-ignore
          message={error.message || error.msg || error.toString()}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ));
    },
    [toast]
  );

  return (
    <ConnectionProvider>
      <ErrorHandlerProvider
        onError={onError}
      >
        <ApolloProvider client={wumboApi}>
          <AccountProvider commitment="confirmed">
            <EndpointSetter>
              <ThemeProvider>
                <AccountsProvider>
                  <SolPriceProvider>
                      <WalletProvider wallets={wallets} onError={console.error}>
                        {children}
                      </WalletProvider>
                  </SolPriceProvider>
                </AccountsProvider>
              </ThemeProvider>
            </EndpointSetter>
          </AccountProvider>
        </ApolloProvider>
      </ErrorHandlerProvider>
    </ConnectionProvider>
  );
};
