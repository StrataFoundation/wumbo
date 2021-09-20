import React, { FC, useCallback, useMemo } from "react";
import { ConnectionProvider, AccountsProvider } from "@oyster/common";
import {
  UsdWumboPriceProvider,
  EndpointSetter,
  WALLET_PROVIDERS,
  WalletProvider,
  Notification,
  AccountCacheContextProvider,
} from "wumbo-common";
import { DrawerProvider } from "@/contexts/drawerContext";
import { WalletName } from "@solana/wallet-adapter-wallets";
import { InjectedWalletAdapter } from "@/utils/wallets";
import { WalletError } from "@solana/wallet-adapter-base";
import toast from "react-hot-toast";
import { ThemeProvider } from "@/contexts/themeContext";

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
          wallet.adapter = () =>
            new InjectedWalletAdapter({ name: wallet.name });
        }

        return wallet;
      }),
    []
  );

  const onError = useCallback(
    (error: WalletError) => {
      console.log("error log!", error);
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
      <AccountCacheContextProvider>
        <EndpointSetter>
          <AccountsProvider>
            <WalletProvider wallets={alteredWallets} onError={onError}>
              <UsdWumboPriceProvider>
                <DrawerProvider>
                  <ThemeProvider>{children}</ThemeProvider>
                </DrawerProvider>
              </UsdWumboPriceProvider>
            </WalletProvider>
          </AccountsProvider>
        </EndpointSetter>
      </AccountCacheContextProvider>
    </ConnectionProvider>
  );
};
