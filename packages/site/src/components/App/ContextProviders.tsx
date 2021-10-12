import React, { useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  WalletProvider,
  WALLET_PROVIDERS,
  EndpointSetter,
  UsdWumboPriceProvider,
  AccountCacheContextProvider,
  wumboApi,
  ThemeProvider,
  SolPriceProvider,
  ErrorHandlingContext,
  Notification,
} from "wumbo-common";
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
      <ErrorHandlingContext.Provider
        value={{
          onError,
        }}
      >
        <ApolloProvider client={wumboApi}>
          <AccountCacheContextProvider>
            <EndpointSetter>
              <ThemeProvider>
                <AccountsProvider>
                  <SolPriceProvider>
                    <UsdWumboPriceProvider>
                      <WalletProvider wallets={wallets} onError={console.error}>
                        {children}
                      </WalletProvider>
                    </UsdWumboPriceProvider>
                  </SolPriceProvider>
                </AccountsProvider>
              </ThemeProvider>
            </EndpointSetter>
          </AccountCacheContextProvider>
        </ApolloProvider>
      </ErrorHandlingContext.Provider>
    </ConnectionProvider>
  );
};
