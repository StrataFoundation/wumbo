import React, { useMemo } from "react";
import {
  WalletProvider,
  WALLET_PROVIDERS,
  EndpointSetter,
  UsdWumboPriceProvider,
  AccountCacheContextProvider,
  wumboApi,
  ThemeProvider
} from "wumbo-common";
import { ApolloProvider } from "@apollo/client";
import { ConnectionProvider, AccountsProvider } from "@oyster/common";

export const ContextProviders: React.FC = ({ children }) => {
  const wallets = useMemo(() => WALLET_PROVIDERS, []);

  return (
    <ConnectionProvider>
      <ApolloProvider client={wumboApi}>
        <AccountCacheContextProvider>
          <EndpointSetter>
            <ThemeProvider>
              <AccountsProvider>
                <UsdWumboPriceProvider>
                  <WalletProvider wallets={wallets}>{children}</WalletProvider>
                </UsdWumboPriceProvider>
              </AccountsProvider>
            </ThemeProvider>
          </EndpointSetter>
        </AccountCacheContextProvider>
      </ApolloProvider>
    </ConnectionProvider>
  );
};
