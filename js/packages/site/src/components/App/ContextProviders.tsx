import React, { useMemo } from "react";
import {
  WalletProvider,
  WALLET_PROVIDERS,
  EndpointSetter,
  UsdWumboPriceProvider,
  AccountCacheContextProvider,
} from "wumbo-common";
import { ConnectionProvider, AccountsProvider } from "@oyster/common";

export const ContextProviders: React.FC = ({ children }) => {
  const wallets = useMemo(() => WALLET_PROVIDERS, []);

  return (
    <ConnectionProvider>
      <AccountCacheContextProvider>
        <EndpointSetter>
          <AccountsProvider>
            <UsdWumboPriceProvider>
              <WalletProvider wallets={wallets}>{children}</WalletProvider>
            </UsdWumboPriceProvider>
          </AccountsProvider>
        </EndpointSetter>
      </AccountCacheContextProvider>
    </ConnectionProvider>
  );
};
