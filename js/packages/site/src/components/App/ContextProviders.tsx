import React from "react";
import { ConnectionProvider, AccountsProvider } from "@oyster/common";
import { WalletProvider } from "../../utils/wallet";

export const ContextProviders: React.FC = ({ children }) => (
  <ConnectionProvider>
    <AccountsProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </AccountsProvider>
  </ConnectionProvider>
);
