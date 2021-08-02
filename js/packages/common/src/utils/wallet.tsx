import React, { useContext } from "react";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { WALLET_PROVIDERS } from "../constants/walletProviders";

export const WalletContext = React.createContext<{
  wallet: WalletAdapter | undefined;
  awaitingApproval: boolean;
  error?: string;
  connected: boolean;
  setProviderUrl: (url: string) => void;
  setAutoConnect: (val: boolean) => void;
  provider: typeof WALLET_PROVIDERS[number] | undefined;
}>({
  wallet: undefined,
  error: undefined,
  connected: false,
  awaitingApproval: false,
  setProviderUrl() {},
  setAutoConnect() {},
  provider: undefined,
});

export const useWallet = () => {
  const {
    error,
    setAutoConnect,
    wallet,
    connected,
    provider,
    setProviderUrl,
    awaitingApproval,
  } = useContext(WalletContext);
  return {
    error,
    wallet,
    connected,
    provider,
    setProviderUrl,
    setAutoConnect,
    awaitingApproval,
    connect() {
      wallet?.connect();
    },
    disconnect() {
      wallet?.disconnect();
    },
  };
};
