import { useConnectionConfig } from "@oyster/common";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "@oyster/common";
import { WalletAdapter } from "@solana/wallet-base";
import { WalletContext, WALLET_PROVIDERS } from "wumbo-common"
import { PublicKey, Transaction } from "@solana/web3.js";
import EventEmitter from "eventemitter3";


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

interface BackgroundState {
  error?: string;
  publicKey?: PublicKey;
  providerUrl?: string;
  setProviderUrl: (url: string) => void;
}

// TODO: Logged in account provider
export const useBackgroundState = (): BackgroundState => {
  const [publicKey, setPublicKey] = useState<PublicKey>();
  const [providerUrl, setProviderUrl] = useLocalStorageState("walletProvider");
  const [error, setError] = useState<string>();

  useEffect(() => {
    function accountMsgListener(msg: any) {
      console.log(msg);
      if (msg && msg.type == "WALLET") {
        msg.error && setError(error);
        if (msg.data.publicKey) {
          try {
            const publicKeyParsed = new PublicKey(msg.data.publicKey.data);
            if (
              !publicKey ||
              publicKeyParsed.toString() != publicKey.toString()
            ) {
              setPublicKey(publicKeyParsed);
              setProviderUrl(msg.data.providerUrl);
            }
          } catch (e) {
            console.error(e);
            setError(e);
          }
        } else {
          setPublicKey(undefined);
        }
      }
    }

    const port = chrome.runtime.connect({ name: "popup" });

    chrome.runtime.sendMessage({ type: "LOAD_WALLET" }, accountMsgListener);

    // For popup
    port.onMessage.addListener(accountMsgListener);
    chrome.runtime.onMessage.addListener(accountMsgListener);
  }, []);

  return {
    publicKey,
    error,
    providerUrl,
    setProviderUrl,
  };
};

class BackgroundWalletAdapter extends EventEmitter implements WalletAdapter {
  publicKey: PublicKey | null;
  providerUrl: string;
  endpoint: string;
  setAwaitingApproval: (awaitingApproval: boolean) => void;

  constructor(
    publicKey: PublicKey | null,
    providerUrl: string,
    endpoint: string,
    setAwaitingApproval: (awaitingApproval: boolean) => void
  ) {
    super();
    this.publicKey = publicKey;
    this.providerUrl = providerUrl;
    this.endpoint = endpoint;
    this.setAwaitingApproval = setAwaitingApproval;
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
    this.setAwaitingApproval(true);
    const transactionResult: Uint8Array = (
      await sendMesssageAsync({
        type: "SIGN_TRANSACTION",
        data: {
          transaction: transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          }),
        },
      })
    ).data;
    this.setAwaitingApproval(false);
    return Transaction.from(transactionResult);
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    this.setAwaitingApproval(true);
    const transactionResult: Uint8Array[] = await sendMesssageAsync({
      type: "SIGN_TRANSACTIONS",
      data: {
        transactions: transactions.map((t) =>
          t.serialize({ requireAllSignatures: false, verifySignatures: false })
        ),
      },
    });
    this.setAwaitingApproval(false);
    return transactionResult.map(Transaction.from);
  }
}

const LOCAL_WALLETS = new Set(["Ledger", "Phantom"]);

export function WalletProvider({ children = null as any }) {
  const { endpoint } = useConnectionConfig();
  const { error, providerUrl, publicKey, setProviderUrl } =
    useBackgroundState();
  const [autoConnect, setAutoConnect] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState<boolean>();
  const wallet = useMemo(
    function () {
      if (providerUrl && !error && endpoint) {
        const adapter = WALLET_PROVIDERS.find((p) => p.url == providerUrl);
        if (adapter && LOCAL_WALLETS.has(adapter.name)) {
          // @ts-ignore
          return new adapter.adapter(providerUrl, endpoint);
        }
        return new BackgroundWalletAdapter(
          publicKey || null,
          providerUrl,
          endpoint,
          setAwaitingApproval
        );
      }
    },
    [publicKey, error, providerUrl, endpoint]
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
        error,
        wallet,
        provider: WALLET_PROVIDERS.find((p) => p.url == providerUrl),
        connected: !!publicKey,
        setAutoConnect,
        setProviderUrl,
        awaitingApproval: !!awaitingApproval,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}