import React, { useMemo } from "react";
import {
  WalletProvider,
  WALLET_PROVIDERS,
  EndpointSetter,
  UsdWumboPriceProvider,
} from "wumbo-common";
import { ConnectionProvider, AccountsProvider } from "@oyster/common";

export const ContextProviders: React.FC = ({ children }) => {
  const wallets = useMemo(() => WALLET_PROVIDERS, []);

  return (
    <ConnectionProvider>
      <EndpointSetter>
        <AccountsProvider>
          <UsdWumboPriceProvider>
            <WalletProvider wallets={wallets}>{children}</WalletProvider>
          </UsdWumboPriceProvider>
        </AccountsProvider>
      </EndpointSetter>
    </ConnectionProvider>
  );
};
