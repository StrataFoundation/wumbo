import React, { useMemo } from "react";
import {
  WalletProvider,
  WALLET_PROVIDERS,
  EndpointSetter,
  UsdWumboPriceProvider,
  AccountCacheContextProvider,
  wumboApi,
  ThemeProvider,
  SolPriceProvider
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
                <SolPriceProvider>
                  <UsdWumboPriceProvider>
                    <WalletProvider wallets={wallets}>{children}</WalletProvider>
                  </UsdWumboPriceProvider>
                </SolPriceProvider>
              </AccountsProvider>
            </ThemeProvider>
          </EndpointSetter>
        </AccountCacheContextProvider>
      </ApolloProvider>
    </ConnectionProvider>
  );
};
