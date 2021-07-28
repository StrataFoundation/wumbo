import React, { useEffect } from "react";
import {
  ConnectionProvider,
  AccountsProvider,
  useLocalStorageState,
} from "@oyster/common";
import { UsdWumboPriceProvider, EndpointSetter } from "wumbo-common";
import { WalletProvider } from "@/utils/wallet";
import { DrawerProvider } from "@/contexts/drawerContext";

export const ContextProviders: React.FC = ({ children }) => {
  return (
    <ConnectionProvider>
      <EndpointSetter>
        <AccountsProvider>
          <WalletProvider>
            <UsdWumboPriceProvider>
              <DrawerProvider>{children}</DrawerProvider>
            </UsdWumboPriceProvider>
          </WalletProvider>
        </AccountsProvider>
      </EndpointSetter>
    </ConnectionProvider>
  );
};
