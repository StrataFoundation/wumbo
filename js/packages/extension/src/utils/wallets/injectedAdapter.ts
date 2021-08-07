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
import { WalletName } from "@solana/wallet-adapter-wallets";

export interface IInjectedWalletAdapterConfig {
  name: WalletName | null;
}

export class InjectedWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter {
  private _name: WalletName | null;
  private _publicKey: PublicKey | null;
  private _connecting: boolean;
  private _connected: boolean;
  private _autoApprove: boolean;

  constructor(config: IInjectedWalletAdapterConfig) {
    super();
    this._name = config.name;
    this._publicKey = null;
    this._connecting = false;
    this._connected = false;
    this._autoApprove = false;

    const self = this;
    window.addEventListener("message", (e: MessageEvent<Message>) => {
      switch (e.data.type) {
        case MessageType.WALLET_RESET: {
          self.emit("disconnect");
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
            reject(new errorConstructor[error.name](error.message, deserializeError(error)));
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
          name: this._name,
        });

        publicKey = new PublicKey(responsePK);
        this._publicKey = publicKey;
        this._connected = true;
        this.emit("connect");
      } catch (error) {
        if (error instanceof WalletError) throw error;
        throw new WalletConnectionError(error?.message, error);
      }
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this._publicKey) {
      try {
        await this.sendMessage({ type: MessageType.WALLET_DISCONNECT });
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
        const { signedTransaction } = await this.sendMessage({
          type: MessageType.SIGN_TRANSACTION,
          transaction: transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          }),
        });
        return Transaction.from(signedTransaction);
      } catch (error) {
        throw new WalletSignatureError(error?.message, error);
      }
    } catch (error) {
      throw error;
    }
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    try {
      if (!this._publicKey) throw new WalletNotConnectedError();

      try {
        const { signedTransactions } = await this.sendMessage({
          type: MessageType.SIGN_TRANSACTIONS,
          transactions: transactions.map((t) =>
            t.serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            })
          ),
        });
        return signedTransactions.map(Transaction.from);
      } catch (error) {
        throw new WalletSignatureError(error?.message, error);
      }
    } catch (error) {
      throw error;
    }
  }
}
