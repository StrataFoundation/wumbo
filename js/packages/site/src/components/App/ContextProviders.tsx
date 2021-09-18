import React, { useMemo } from "react";
import {
  WalletProvider,
  WALLET_PROVIDERS,
  EndpointSetter,
  UsdWumboPriceProvider,
  AccountCacheContextProvider,
  wumboApi
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
            <AccountsProvider>
              <UsdWumboPriceProvider>
                <WalletProvider wallets={wallets}>{children}</WalletProvider>
              </UsdWumboPriceProvider>
            </AccountsProvider>
          </EndpointSetter>
        </AccountCacheContextProvider>
      </ApolloProvider>
    </ConnectionProvider>
  );
};
