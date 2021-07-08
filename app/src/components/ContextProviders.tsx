import React from "react";
import { LastLocationProvider } from "react-router-last-location";
import { ConnectionProvider } from "@oyster/common/lib/contexts/connection";
import { AccountsProvider } from "@oyster/common/lib/contexts/accounts";
import { UsdWumboPriceProvider } from "@/utils/pricing";
import { WalletProvider } from "@/utils/wallet";
import { DrawerProvider } from "@/contexts/drawerContext";

export const ContextProviders: React.FC = ({ children }) => (
  <LastLocationProvider>
    <ConnectionProvider>
      <AccountsProvider>
        <WalletProvider>
          <UsdWumboPriceProvider>
            <DrawerProvider>{children}</DrawerProvider>
          </UsdWumboPriceProvider>
        </WalletProvider>
      </AccountsProvider>
    </ConnectionProvider>
  </LastLocationProvider>
);
