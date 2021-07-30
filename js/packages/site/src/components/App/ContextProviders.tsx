import React, { useEffect } from "react";
import { EndpointSetter } from "wumbo-common";
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
          <WalletProvider>{children}</WalletProvider>
        </AccountsProvider>
      </EndpointSetter>
    </ConnectionProvider>
  );
};
