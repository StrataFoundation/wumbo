// credit https://github.com/solana-labs/wallet-adapter/blob/master/packages/react/src/WalletProvider.tsx
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  WalletAdapter,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";
import { Wallet, WalletName } from "@solana/wallet-adapter-wallets";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useLocalStorage } from "../utils";

export interface IWalletProviderProps {
  children: ReactNode;
  wallets: Wallet[];
  autoConnect?: boolean;
  onError?: (error: WalletError) => void;
}

export interface IWalletContextState {
  wallet: Wallet | undefined;
  adapter: WalletAdapter | undefined;
  select: (walletName: WalletName) => void;

  publicKey: PublicKey | null;
  ready: boolean;
  connecting: boolean;
  disconnecting: boolean;
  connected: boolean;
  autoApprove: boolean;
  awaitingApproval: boolean;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>;
}

const WalletContext = createContext<IWalletContextState>({} as IWalletContextState);

export class WalletNotSelectedError extends WalletError {}

const WalletProvider: FC<IWalletProviderProps> = ({
  children,
  wallets,
  onError = (error: WalletError) => console.log(error),
  autoConnect = false,
}) => {
  const [selectCount, setSelectCount] = useState<number>(0);
  const [name, setName] = useState<WalletName | null>(null);
  const [wallet, setWallet] = useState<Wallet>();

  const [adapter, setAdapter] = useState<WalletAdapter>();
  const [ready, setReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [publicKey, setPublicKey] = useLocalStorage<string | null>("walletPublicKey", null);
  const [awaitingApproval, setAwaitingApproval] = useState<boolean>(false);

  const walletsByName = useMemo(
    () =>
      wallets.reduce((walletsByName, wallet) => {
        walletsByName[wallet.name] = wallet;
        return walletsByName;
      }, {} as { [name in WalletName]: Wallet }),
    [wallets]
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
  }, [setReady, setConnecting, setDisconnecting, setConnected, setAutoApprove]);

  const onReady = useCallback(() => setReady(true), [setReady]);

  const onConnect = useCallback(() => {
    if (!adapter) return;

    setConnected(true);
    setAutoApprove(adapter.autoApprove);
    const newPublicKey = adapter.publicKey?.toBase58();
    setPublicKey(newPublicKey || null);
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
    const adapter = wallet ? wallet.adapter() : undefined;
    const asyncReady = async () => {
      const ready =
        adapter && Object.getOwnPropertyDescriptor(Object.getPrototypeOf(adapter), "readyAsync")
          ? await (adapter as any)?.readyAsync
          : !!adapter?.ready;
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
        const ready = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(adapter), "readyAsync")
          ? await (adapter as any)?.readyAsync
          : !!adapter?.ready;

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
        adapter,
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export { WalletProvider, useWallet };
