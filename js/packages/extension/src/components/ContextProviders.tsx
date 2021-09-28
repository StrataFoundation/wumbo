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
  ErrorHandlingContext,
  ThemeProvider,
  SolPriceProvider
} from "wumbo-common";
import { ApolloProvider } from "@apollo/client";
import { DrawerProvider } from "@/contexts/drawerContext";
import { WalletName } from "@solana/wallet-adapter-wallets";
import { InjectedWalletAdapter } from "@/utils/wallets";
import toast from "react-hot-toast";
import { HistoryContextProvider } from "../utils/history";
import * as Sentry from "@sentry/react";

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
    (error: Error) => {
      console.error(error);
      Sentry.captureException(error);
      if (error.message?.includes("Attempt to debit an account but found no record of a prior credit.")) {
        error = new Error("Not enough SOL to perform this action");
      }

      const code = (error.message?.match("custom program error: (.*)") ||
        [])[1];
      if (code == "0x1") {
        error = new Error("Insufficient balance.");
      } else if (code == "0x136") {
        error = new Error("Purchased more than the cap of 100 bWUM");
      } else if (code === "0x0") {
        error = new Error("Blockhash expired. Please retry")
      }
      
      toast.custom((t) => (
        <Notification
          type="error"
          show={t.visible}
          heading={error.name}
          // @ts-ignore
          message={error.message || error.msg || error.toString()}
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
          onError,
        }}
      >
        <ApolloProvider client={wumboApi}>
          <AccountCacheContextProvider>
            <EndpointSetter>
              <AccountsProvider>
                <WalletProvider wallets={alteredWallets} onError={console.error}>
                  <SolPriceProvider>
                    <UsdWumboPriceProvider>
                      <HistoryContextProvider>
                        <DrawerProvider>
                          <ThemeProvider>{children}</ThemeProvider>
                        </DrawerProvider>
                      </HistoryContextProvider>
                    </UsdWumboPriceProvider>
                  </SolPriceProvider>
                </WalletProvider>
              </AccountsProvider>
            </EndpointSetter>
          </AccountCacheContextProvider>
        </ApolloProvider>
      </ErrorHandlingContext.Provider>
    </ConnectionProvider>
  );
};
