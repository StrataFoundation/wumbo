import React, { useEffect, useMemo, useState } from "react";
import { useConnectionConfig, useLocalStorageState } from "@oyster/common";
import {
  EventEmitter,
  WalletAdapter,
  WalletAdapterEvents,
} from "@solana/wallet-adapter-base";
import { WalletContext, WALLET_PROVIDERS } from "wumbo-common";
import { PublicKey } from "@solana/web3.js";
import { InjectedWalletAdapter } from "./wallets/injectedAdapter";

interface BackgroundState {
  error: [
    string | undefined,
    React.Dispatch<React.SetStateAction<string | undefined>>
  ];
  publicKey: [PublicKey | null, (pk: PublicKey | null) => void];
  providerUrl: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>
  ];
}

// TODO: Logged in account provider
export const useBackgroundState = (): BackgroundState => {
  const [publicKey, setPublicKey] = useLocalStorageState("walletPubKey");
  const [providerUrl, setProviderUrl] = useLocalStorageState("walletProvider");
  const [error, setError] = useState<string>();

  const handleSetPublicKey = (pk: PublicKey | null) => {
    setPublicKey(pk ? pk.toBase58() : null);
  };

  const handleReturnPubKey = (pk: PublicKey | null) => {
    return pk ? new PublicKey(pk) : null;
  };

  console.log(handleReturnPubKey(publicKey));

  return {
    error: [error, setError],
    publicKey: [handleReturnPubKey(publicKey), handleSetPublicKey],
    providerUrl: [providerUrl, setProviderUrl],
  };
};

export function WalletProvider({ children = null as any }) {
  const { endpoint } = useConnectionConfig();
  const {
    error: [error, setError],
    publicKey: [publicKey, setPublicKey],
    providerUrl: [providerUrl, setProviderUrl],
  } = useBackgroundState();
  const [autoConnect, setAutoConnect] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState<boolean>(false);
  const wallet = useMemo(() => {
    if (providerUrl && !error && endpoint) {
      return new InjectedWalletAdapter({
        publicKey: [publicKey, setPublicKey],
        providerUrl: [providerUrl, setProviderUrl],
        awaitingApproval: [awaitingApproval, setAwaitingApproval],
        endpoint,
      });
    }
  }, [providerUrl]);

  useEffect(() => {
    if (wallet && autoConnect) {
      wallet.connect();
      setAutoConnect(false);
    }
  }, [wallet, autoConnect]);

  return (
    <WalletContext.Provider
      value={{
        error,
        wallet,
        provider: WALLET_PROVIDERS.find((p) => p.url == providerUrl),
        connected: !!wallet?.connected,
        setAutoConnect,
        setProviderUrl,
        awaitingApproval: !!awaitingApproval,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
