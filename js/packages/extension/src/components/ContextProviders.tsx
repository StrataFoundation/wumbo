import React, { FC, useCallback, useMemo } from "react";
import { ConnectionProvider, AccountsProvider } from "@oyster/common";
import {
  UsdWumboPriceProvider,
  EndpointSetter,
  WALLET_PROVIDERS,
  WalletProvider,
  Notification,
  AccountCacheContextProvider,
  wumboApi,
  ErrorHandlingContext
} from "wumbo-common";
import { ApolloProvider } from "@apollo/client"
import { DrawerProvider } from "@/contexts/drawerContext";
import { WalletName } from "@solana/wallet-adapter-wallets";
import { InjectedWalletAdapter } from "@/utils/wallets";
import { WalletError } from "@solana/wallet-adapter-base";
import toast from "react-hot-toast";

export const ContextProviders: FC = ({ children }) => {
  const alteredWallets = useMemo(
    () =>
      WALLET_PROVIDERS.map((wallet) => {
        const injectedWalletNames = [
          WalletName.Phantom,
          WalletName.Ledger,
          WalletName.Sollet,
          WalletName.Solong,
        ];

        if (injectedWalletNames.includes(wallet.name)) {
          wallet.adapter = () => new InjectedWalletAdapter({ name: wallet.name });
        }

        return wallet;
      }),
    []
  );

  const onError = useCallback(
    (error: Error) => {
      console.error(error);
      const code = (error.message?.match("custom program error: (.*)") || [])[1];
      if (code == "0x1") {
        error = new Error("Insufficient balance.")
      }
      toast.custom((t) => (
        <Notification
          type="error"
          show={t.visible}
          heading={error.name}
          message={error.message}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ));
    },
    [toast]
  );

  return (
    <ConnectionProvider>
      <ErrorHandlingContext.Provider
        value={{
          onError
        }}
      >
        <ApolloProvider client={wumboApi}>
          <AccountCacheContextProvider>
            <EndpointSetter>
              <AccountsProvider>
                <WalletProvider wallets={alteredWallets} onError={onError}>
                  <UsdWumboPriceProvider>
                    <DrawerProvider>{children}</DrawerProvider>
                  </UsdWumboPriceProvider>
                </WalletProvider>
              </AccountsProvider>
            </EndpointSetter>
          </AccountCacheContextProvider>
        </ApolloProvider>
      </ErrorHandlingContext.Provider>
    </ConnectionProvider>
  );
};
