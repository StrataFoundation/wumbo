import {
  WalletName,
  EventEmitter,
  SignerWalletAdapter,
  WalletAdapterEvents,
  WalletConnectionError,
  WalletDisconnectionError,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignMessageError,
  WalletWindowClosedError,
  SendTransactionOptions,
  WalletReadyState,
} from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { MessageType, Message } from "./types";
import { deserializeError } from "serialize-error";
import { sleep } from "wumbo-common";

export interface IInjectedWalletAdapterConfig {
  name: WalletName;
  url: string | null;
  icon: string | null;
}

export class InjectedWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements SignerWalletAdapter
{
  private _name: WalletName;
  private _url: string | null;
  private _icon: string | null;
  private _publicKey: PublicKey | null;
  private _connecting: boolean;
  private _connected: boolean;
  private _autoApprove: boolean;

  constructor(config: IInjectedWalletAdapterConfig) {
    super();
    this._name = config.name;
    this._url = config.url;
    this._icon = config.icon;
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
  readyState: WalletReadyState = WalletReadyState.Installed;

  sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options?: SendTransactionOptions
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get ready(): boolean {
    // dont use this
    // need to vallidate extending
    // use readyAsync
    return true;
  }

  get url(): string {
    return this._url || "";
  }
  
  get name(): WalletName {
    return this._name;
  }

  readyAsync(): Promise<boolean> {
    return (async () => {
      try {
        const { ready } = await this.sendMessage(
          {
            type: MessageType.WALLET_READY,
            name: this._name,
          },
          500
        );

        return ready;
      } catch (error: any) {
        return false;
      }
    })();
  }

  async waitForReady(): Promise<void> {
    let ready = await this.readyAsync();
    while (!ready) {
      ready = await this.readyAsync();
      await sleep(500);
      console.log("Injected wallet not ready, trying again...");
    }
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

  get icon(): string {
    return this._icon || "";
  }

  async sendMessage(m: Message, timeoutMs: number = -1): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();

      let timeout: any;
      if (timeoutMs > 0) {
        timeout = setTimeout(() => {
          reject(new WalletConnectionError("Not ready"));
        }, timeoutMs);
      }

      const listener = (e: MessageEvent) => {
        const { error, ...rest } = e.data;
        timeout && clearTimeout(timeout);
        if (error) {
          // errors are returned serialized
          // reconstruct them and reject them
          const errorConstructor: { [key: string]: any } = {
            WalletNotReadyError: WalletNotReadyError,
            WalletWindowClosedError: WalletWindowClosedError,
            WalletConnectionError: WalletConnectionError,
            WalletSignMessageError: WalletSignMessageError,
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

      messageChannel.port1.onmessage = listener;

      // TODO: determrin security risks here
      window.postMessage(m, "*", [messageChannel.port2]);
    });
  }

  async connect(): Promise<void> {
    let publicKey: PublicKey | null = null;

    try {
      if (this.connected || this.connecting) return;
      this._connecting = true;
      await this.waitForReady();

      try {
        const { publicKey: responsePK } = await this.sendMessage({
          type: MessageType.WALLET_CONNECT,
          name: this._name,
        });

        publicKey = new PublicKey(responsePK);
        this._publicKey = publicKey;
        this._connected = true;
        this.emit("connect", publicKey);
      } catch (error: any) {
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
        this._connected = false;
      } catch (error: any) {
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
            verifySignatures: true,
          }),
        });

        const signed = Transaction.from(signedTransaction);
        transaction.signatures = signed.signatures;
        return signed;
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
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
        const { signedTransactions } = await this.sendMessage({
          type: MessageType.SIGN_TRANSACTIONS,
          transactions: transactions.map((t) =>
            t.serialize({
              requireAllSignatures: false,
              verifySignatures: true,
            })
          ),
        });
        const txns = signedTransactions.map(Transaction.from);
        return txns;
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error) {
      throw error;
    }
  }
}
