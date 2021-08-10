import React, { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";
import { WalletContext, WALLET_PROVIDERS, useLocalStorage, Notification } from "wumbo-common";
import { PublicKey, Transaction } from "@solana/web3.js";
import { InjectedWalletAdapter } from "./wallets/injectedAdapter";
import { Wallet, WalletName } from "@solana/wallet-adapter-wallets";
import toast from "react-hot-toast";

export interface IWalletProviderProps {
  children: ReactNode;
}

export class WalletNotSelectedError extends WalletError {}

export const WalletProvider: FC<IWalletProviderProps> = ({ children }) => {
  const [selectCount, setSelectCount] = useState<number>(0);
  const [name, setName] = useState<WalletName | null>(null);
  const [wallet, setWallet] = useState<Wallet>();
  const [adapter, setAdapter] = useState<InjectedWalletAdapter>();
  const [ready, setReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [publicKey, setPublicKey] = useLocalStorage<string | null>("walletPublicKey", null);
  const [awaitingApproval, setAwaitingApproval] = useState<boolean>(false);
  const [error, setError] = useState<WalletError>();

  const onError = useCallback(
    (error: WalletError) => {
      console.log("error log!", error);
      setError(error);
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

  const walletsByName = useMemo(
    () =>
      WALLET_PROVIDERS.reduce((walletsByName, wallet) => {
        walletsByName[wallet.name] = wallet;
        return walletsByName;
      }, {} as { [name in WalletName]: Wallet }),
    [WALLET_PROVIDERS]
  );

  const select = useCallback(
    async (selected: WalletName | null) => {
      setSelectCount(selectCount + 1);
      if (name === selected) return;
      setName(selected);
    },
    [name, setName, selectCount, setSelectCount]
  );

  const reset = useCallback(() => {
    setReady(false);
    setConnecting(false);
    setDisconnecting(false);
    setConnected(false);
    setAutoApprove(false);
    setError(undefined);
  }, [setReady, setConnecting, setDisconnecting, setConnected, setAutoApprove, setError]);

  const onReady = useCallback(() => setReady(true), [setReady]);

  const onConnect = useCallback(() => {
    if (!adapter) return;

    setConnected(true);
    setAutoApprove(adapter.autoApprove);
    setPublicKey(adapter.publicKey?.toBase58() || null);
  }, [adapter, setConnected, setAutoApprove, setPublicKey]);

  const onDisconnect = useCallback(() => reset(), [reset]);

  const connect = useCallback(async () => {
    if (connecting || disconnecting || connected) return;

    if (!wallet || !adapter) {
      const error = new WalletNotSelectedError();
      onError(error);
      throw error;
    }

    if (!ready) {
      window.open(wallet!.url, "_blank");

      const error = new WalletNotReadyError();
      onError(error);
      throw error;
    }

    setConnecting(true);
    try {
      await adapter!.connect();
    } finally {
      setConnecting(false);
    }
  }, [connecting, disconnecting, connected, adapter, onError, ready, wallet, setConnecting]);

  const disconnect = useCallback(async () => {
    if (disconnecting) return;

    if (!adapter) {
      await select(null);
      return;
    }

    setDisconnecting(true);
    try {
      await adapter.disconnect();
    } finally {
      setDisconnecting(false);
      await select(null);
    }
  }, [disconnecting, adapter, select, setDisconnecting]);

  const signTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!connected) {
        const error = new WalletNotConnectedError();
        onError(error);
        throw error;
      }

      setAwaitingApproval(true);
      try {
        return await adapter!.signTransaction(transaction);
      } catch (error) {
        onError(error);
        throw error;
      } finally {
        setAwaitingApproval(false);
      }
    },
    [adapter, onError, connected, setAwaitingApproval]
  );

  const signAllTransactions = useCallback(
    async (transactions: Transaction[]) => {
      if (!connected) {
        const error = new WalletNotConnectedError();
        onError(error);
        throw error;
      }

      setAwaitingApproval(true);
      try {
        return await adapter!.signAllTransactions(transactions);
      } catch (error) {
        onError(error);
        throw error;
      } finally {
        setAwaitingApproval(false);
      }
    },
    [adapter, onError, connected]
  );

  // Reset state and set the wallet, adapter, and ready state when the name changes
  useEffect(() => {
    reset();
    const wallet = name ? walletsByName[name] : undefined;
    const adapter = wallet ? new InjectedWalletAdapter({ name }) : undefined;
    const asyncReady = async () => {
      const ready = adapter ? await adapter.readyAsync : false;
      setReady(ready);
    };

    setWallet(wallet);
    setAdapter(adapter);
    asyncReady();
  }, [reset, name, walletsByName, setWallet, setAdapter, setReady]);

  // Setup and teardown event listeners when the adapter changes
  useEffect(() => {
    if (adapter) {
      adapter.on("ready", onReady);
      adapter.on("connect", onConnect);
      adapter.on("disconnect", onDisconnect);
      adapter.on("error", onError);
      return () => {
        adapter.off("ready", onReady);
        adapter.off("connect", onConnect);
        adapter.off("disconnect", onDisconnect);
        adapter.off("error", onError);
      };
    }
  }, [adapter, onReady, onConnect, onDisconnect, onError]);

  // Try to connect when the adapter changes and is ready
  useEffect(() => {
    (async function () {
      if (adapter) {
        const ready = await adapter?.readyAsync;

        if (!ready && wallet?.name === name) {
          window.open(wallet!.url, "_blank");
        }

        if (ready && wallet?.name === name) {
          setConnecting(true);
          try {
            await adapter.connect();
          } catch (error) {
            // Don't throw error, but onError will still be called
          } finally {
            setConnecting(false);
          }
        }
      }
    })();
  }, [selectCount, adapter, ready, setConnecting]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        walletAdapter: adapter,
        select,
        publicKey: publicKey ? new PublicKey(publicKey) : null,
        ready,
        connecting,
        disconnecting,
        connected,
        autoApprove,
        connect,
        disconnect,
        signTransaction,
        signAllTransactions,
        awaitingApproval,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
