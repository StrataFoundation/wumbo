import React, { FC } from "react";
import { ConnectionProvider, AccountsProvider } from "@oyster/common";
import { UsdWumboPriceProvider, EndpointSetter } from "wumbo-common";
import { WalletProvider } from "@/utils/wallet";
import { DrawerProvider } from "@/contexts/drawerContext";

export const ContextProviders: FC = ({ children }) => {
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
