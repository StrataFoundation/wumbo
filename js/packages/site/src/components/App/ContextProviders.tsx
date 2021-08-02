import React, { useEffect } from "react";
import { EndpointSetter, UsdWumboPriceProvider } from "wumbo-common";
import {
  ConnectionProvider,
  AccountsProvider,
  useLocalStorageState,
} from "@oyster/common";
import { WalletProvider } from "../../utils/wallet";

export const ContextProviders: React.FC = ({ children }) => {
  return (
    <ConnectionProvider>
      <EndpointSetter>
        <AccountsProvider>
          <UsdWumboPriceProvider>
            <WalletProvider>{children}</WalletProvider>
          </UsdWumboPriceProvider>
        </AccountsProvider>
      </EndpointSetter>
    </ConnectionProvider>
  );
};
