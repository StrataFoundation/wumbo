import React from "react";
import {
  EventEmitter,
  WalletAdapter,
  WalletAdapterEvents,
  WalletConnectionError,
  WalletDisconnectionError,
  WalletError,
  WalletNotConnectedError,
  WalletNotFoundError,
  WalletNotInstalledError,
  WalletSignatureError,
  WalletWindowClosedError,
} from "@solana/wallet-adapter-base";
import { PublicKey, Transaction } from "@solana/web3.js";
import { MessageType, Message } from "./types";
import { deserializeError } from "serialize-error";

export interface IInjectedWalletAdapterConfig {
  endpoint: string;
  publicKey: [PublicKey | null, (pk: PublicKey | null) => void];
  providerUrl: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>
  ];
  awaitingApproval: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

export class InjectedWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter {
  private _publicKey: PublicKey | null;
  private _connecting: boolean;
  private _connected: boolean;
  private _providerUrl: string | null;
  private _endpoint: string;
  private _setProviderUrl: (url: string | null) => void;
  private _setPublicKey: (key: PublicKey | null) => void;
  private _awaitingApproval: boolean;
  private _setAwaitingApproval: (awaitingApproval: boolean) => void;
  private _resetWallet: () => void;

  constructor(config: IInjectedWalletAdapterConfig) {
    super();
    [this._publicKey, this._setPublicKey] = config.publicKey;
    [this._providerUrl, this._setProviderUrl] = config.providerUrl;
    [
      this._awaitingApproval,
      this._setAwaitingApproval,
    ] = config.awaitingApproval;
    this._connecting = false;
    this._connected = false;
    this._endpoint = config.endpoint;
    this._resetWallet = () => {
      this._setProviderUrl(null);
    };

    const self = this;

    // TODO: determrin security risks here
    window.addEventListener("message", (e: MessageEvent<Message>) => {
      switch (e.data.type) {
        case MessageType.WALLET_RESET: {
          self._resetWallet();
          break;
        }
      }
    });
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get ready(): boolean {
    // TODO: @FIXME
    return true;
  }

  get providerUrl(): string | null {
    return this._providerUrl;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._connected;
  }

  get autoApprove(): boolean {
    return false;
  }

  async sendMessage(m: Message): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (e: MessageEvent) => {
        const { error, ...rest } = e.data;

        if (error) {
          // errors are returned serialized
          // reconstruct them and reject them
          const errorConstructor: { [key: string]: any } = {
            WalletNotFoundError: WalletNotFoundError,
            WalletNotInstalledError: WalletNotInstalledError,
            WalletWindowClosedError: WalletWindowClosedError,
            WalletConnectionError: WalletConnectionError,
            WalletSignatureError: WalletSignatureError,
            WalletDisconnectError: WalletDisconnectionError,
            WalletError: WalletError,
          };

          if (!(error.name in errorConstructor)) {
            reject(deserializeError(error));
          } else {
            reject(
              new errorConstructor[error.name](
                error.message,
                deserializeError(error)
              )
            );
          }
        }
        resolve(rest);
      };

      // TODO: determrin security risks here
      window.postMessage(m, "*", [messageChannel.port2]);
    });
  }

  async connect(): Promise<void> {
    let publicKey: PublicKey | null = null;

    try {
      if (this.connected || this.connecting) return;
      this._connecting = true;

      try {
        const { publicKey: responsePK } = await this.sendMessage({
          type: MessageType.WALLET_CONNECT,
          providerUrl: this._providerUrl,
        });

        publicKey = new PublicKey(responsePK);

        this._setPublicKey(publicKey);
        this.emit("connect");
      } catch (error) {
        if (error instanceof WalletWindowClosedError)
          return this._resetWallet();
        if (error instanceof WalletError) throw error;
        throw new WalletConnectionError(error?.message, error);
      }
    } finally {
      this._connected = true;
      this._connecting = false;
      this._publicKey = publicKey;
    }
  }

  async disconnect(): Promise<void> {
    if (this._publicKey) {
      try {
        await this.sendMessage({ type: MessageType.WALLET_DISCONNECT });
        this._setPublicKey(null);
        this._setProviderUrl(null);
        this.emit("disconnect");
      } catch (error) {
        throw new WalletDisconnectionError();
      }
    }
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      if (!this._publicKey) throw new WalletNotConnectedError();

      try {
        this._setAwaitingApproval(true);

        const { signedTransaction } = await this.sendMessage({
          type: MessageType.SIGN_TRANSACTION,
          transaction: transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          }),
        });

        this._setAwaitingApproval(false);
        return Transaction.from(signedTransaction);
      } catch (error) {
        this._setAwaitingApproval(false);
        throw new WalletSignatureError(error?.message, error);
      }
    } catch (error) {
      throw error;
    }
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    try {
      if (!this._publicKey) throw new WalletNotConnectedError();

      try {
        this._setAwaitingApproval(true);

        const { signedTransactions } = await this.sendMessage({
          type: MessageType.SIGN_TRANSACTIONS,
          transactions: transactions.map((t) =>
            t.serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            })
          ),
        });

        this._setAwaitingApproval(false);

        return signedTransactions.map(Transaction.from);
      } catch (error) {
        this._setAwaitingApproval(false);
        throw new WalletSignatureError(error?.message, error);
      }
    } catch (error) {
      throw error;
    }
  }
}
