import React from "react";
import { ConnectionProvider, AccountsProvider } from "@oyster/common";
import { UsdWumboPriceProvider } from "@/utils/pricing";
import { WalletProvider } from "@/utils/wallet";
import { DrawerProvider } from "@/contexts/drawerContext";

export const ContextProviders: React.FC = ({ children }) => (
  <ConnectionProvider>
    <AccountsProvider>
      <WalletProvider>
        <UsdWumboPriceProvider>
          <DrawerProvider>{children}</DrawerProvider>
        </UsdWumboPriceProvider>
      </WalletProvider>
    </AccountsProvider>
  </ConnectionProvider>
);
