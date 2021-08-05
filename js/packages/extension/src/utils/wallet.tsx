import React, { useEffect, useMemo, useState } from "react";
import { useConnectionConfig, useLocalStorageState } from "@oyster/common";
import {
  EventEmitter,
  WalletAdapter,
  WalletAdapterEvents,
} from "@solana/wallet-adapter-base";
import { WalletContext, WALLET_PROVIDERS } from "wumbo-common";
import { PublicKey, Transaction } from "@solana/web3.js";
import { InjectedWalletAdapter } from "./wallets/injectedAdapter";

function sendMessageAsync(message: any): Promise<any> {
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

export interface BackgroundWalletAdapterConfig {
  publicKey: PublicKey | null;
  providerUrl: string;
  endpoint: string;
  setAwaitingApproval: (awaitingApproval: boolean) => void;
}

class BackgroundWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter {
  private _publicKey: PublicKey | null;
  private _providerUrl: string;
  private _endpoint: string;
  private _connecting: boolean;
  private _setAwaitingApproval: (awaitingApproval: boolean) => void;

  constructor(config: BackgroundWalletAdapterConfig) {
    super();
    this._publicKey = config.publicKey || null;
    this._providerUrl = config.providerUrl;
    this._endpoint = config.endpoint;
    this._connecting = false;
    this._setAwaitingApproval = config.setAwaitingApproval;
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get providerUrl(): string {
    return this._providerUrl;
  }

  get endpoint(): string {
    return this._endpoint;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get ready(): boolean {
    // @FIXME
    return true;
  }

  get connected(): boolean {
    return !!this._publicKey;
  }

  get autoApprove(): boolean {
    return false;
  }

  connect() {
    return sendMessageAsync({
      type: "WALLET_CONNECT",
      data: { providerUrl: this._providerUrl, endpoint: this._endpoint },
    });
  }

  disconnect() {
    return sendMessageAsync({ type: "WALLET_DISCONNECT" });
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    this._setAwaitingApproval(true);
    const transactionResult: Uint8Array = (
      await sendMessageAsync({
        type: "SIGN_TRANSACTION",
        data: {
          transaction: transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          }),
        },
      })
    ).data;
    this._setAwaitingApproval(false);
    return Transaction.from(transactionResult);
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    this._setAwaitingApproval(true);
    const transactionResult: Uint8Array[] = await sendMessageAsync({
      type: "SIGN_TRANSACTIONS",
      data: {
        transactions: transactions.map((t) =>
          t.serialize({ requireAllSignatures: false, verifySignatures: false })
        ),
      },
    });
    this._setAwaitingApproval(false);
    return transactionResult.map(Transaction.from);
  }
}

const LOCAL_WALLETS = new Set(["Ledger"]);

export function WalletProvider({ children = null as any }) {
  const { endpoint } = useConnectionConfig();
  const {
    error,
    providerUrl,
    publicKey,
    setProviderUrl,
  } = useBackgroundState();
  const [autoConnect, setAutoConnect] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState<boolean>();
  const wallet = useMemo(
    function () {
      if (providerUrl && !error && endpoint) {
        const adapter = WALLET_PROVIDERS.find((p) => p.url == providerUrl);
        if (adapter && LOCAL_WALLETS.has(adapter.name)) {
          return adapter.adapter();
        }

        if (adapter && adapter.name === "Phantom") {
          return new InjectedWalletAdapter({
            publicKey: publicKey || null,
            providerUrl,
            endpoint,
            setAwaitingApproval,
          });
        }

        return new BackgroundWalletAdapter({
          publicKey: publicKey || null,
          providerUrl,
          endpoint,
          setAwaitingApproval,
        });
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
