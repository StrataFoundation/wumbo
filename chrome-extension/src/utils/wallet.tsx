import {useConnectionConfig} from "@oyster/common/lib/contexts/connection";
import React, {useContext, useEffect, useMemo, useState} from "react";
import {useLocalStorageState} from "@oyster/common/lib/utils/utils";
import {WalletAdapter} from "@solana/wallet-base";
import {WALLET_PROVIDERS} from "../constants/walletProviders";
import {PublicKey, Transaction} from "@solana/web3.js";
import {useLoggedInAccount} from "./auth";
import {AccountInfo as TokenAccountInfo} from "@solana/spl-token";
import EventEmitter from "eventemitter3";

const WalletContext = React.createContext<{
  wallet: WalletAdapter | undefined;
  solcloutAccount?: TokenAccountInfo;
  error?: string;
  connected: boolean;
  setProviderUrl: (url: string) => void;
  setAutoConnect: (val: boolean) => void;
  provider: typeof WALLET_PROVIDERS[number] | undefined;
}>({
  wallet: undefined,
  error: undefined,
  connected: false,
  setProviderUrl() {},
  setAutoConnect() {},
  provider: undefined,
});

function sendMesssageAsync(message: any): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    chrome.runtime.sendMessage(message, (result) => {
      if (result && result.error) {
        reject(result.error);
      } else {
        resolve(result);
      }
    });
  });
}

class BackgroundWalletAdapter extends EventEmitter implements WalletAdapter {
  publicKey: PublicKey | null;
  providerUrl: string;
  endpoint: string;

  constructor(
    publicKey: PublicKey | null,
    providerUrl: string,
    endpoint: string
  ) {
    super();
    this.publicKey = publicKey;
    this.providerUrl = providerUrl;
    this.endpoint = endpoint;
  }

  connect() {
    return sendMesssageAsync({
      type: "WALLET_CONNECT",
      data: { providerUrl: this.providerUrl, endpoint: this.endpoint },
    });
  }

  disconnect() {
    return sendMesssageAsync({ type: "WALLET_DISCONNECT" });
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    const transactionResult: Uint8Array = (
      await sendMesssageAsync({
        type: "SIGN_TRANSACTION",
        data: { transaction: transaction.serialize() },
      })
    ).data;
    return Transaction.from(transactionResult);
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    const transactionResult: Uint8Array[] = await sendMesssageAsync({
      type: "SIGN_TRANSACTIONS",
      data: { transactions },
    });

    return transactionResult.map(Transaction.from);
  }
}

export function WalletProvider({ children = null as any }) {
  const { endpoint } = useConnectionConfig();
  const accountInfo = useLoggedInAccount();
  const [autoConnect, setAutoConnect] = useState(false);
  const [providerUrl, setProviderUrl] = useLocalStorageState("walletProvider");

  const wallet = useMemo(
    function () {
      if (providerUrl && !accountInfo.error && endpoint) {
        return new BackgroundWalletAdapter(
          accountInfo.publicKey || null,
          providerUrl,
          endpoint
        );
      }
    },
    [accountInfo, providerUrl, endpoint]
  );

  useEffect(() => {
    if (wallet && autoConnect) {
      wallet.connect();
      setAutoConnect(false);
    }
  }, [wallet, autoConnect]);

  return (
    <WalletContext.Provider
      value={{
        error: accountInfo.error,
        wallet,
        provider: WALLET_PROVIDERS.find((p) => p.url == providerUrl),
        connected: !!accountInfo.publicKey,
        setAutoConnect,
        solcloutAccount: accountInfo.solcloutAccount,
        setProviderUrl,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const {
    error,
    setAutoConnect,
    wallet,
    connected,
    provider,
    setProviderUrl,
  } = useContext(WalletContext);
  return {
    error,
    wallet,
    connected,
    provider,
    setProviderUrl,
    setAutoConnect,
    connect() {
      wallet?.connect();
    },
    disconnect() {
      wallet?.disconnect();
    },
  };
};
