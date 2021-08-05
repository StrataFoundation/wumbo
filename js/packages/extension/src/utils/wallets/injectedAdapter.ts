import {
  EventEmitter,
  WalletAdapter,
  WalletAdapterEvents,
  WalletConnectionError,
  WalletDisconnectionError,
  WalletError,
  WalletNotConnectedError,
  WalletSignatureError,
} from "@solana/wallet-adapter-base";
import { PublicKey, Transaction } from "@solana/web3.js";

interface IError {
  name: string;
  messsage: string;
}

export interface IMessage {
  type: string;
  data?: any;
  error?: IError;
}

export interface IInjectedWalletAdapterConfig {
  publicKey: PublicKey | null;
  providerUrl: string;
  endpoint: string;
  setAwaitingApproval: (awaitingApproval: boolean) => void;
}

export class InjectedWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter {
  private _publicKey: PublicKey | null;
  private _connecting: boolean;
  private _connected: boolean;
  private _providerUrl: string;
  private _endpoint: string;
  private _setAwaitingApproval: (awaitingApproval: boolean) => void;

  constructor(config: IInjectedWalletAdapterConfig) {
    super();
    this._publicKey = config.publicKey || null;
    this._connecting = false;
    this._connected = false;
    this._providerUrl = config.providerUrl;
    this._endpoint = config.endpoint;
    this._setAwaitingApproval = config.setAwaitingApproval;
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

  async sendInjectedMessage(m: IMessage): Promise<any> {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (e: IMessage) => resolve(e.data);
      window.postMessage(m, "*", [messageChannel.port2]);
    });
  }

  async sendLocalMessage(m: IMessage): Promise<any> {
    return new Promise<void>((resolve) => {
      chrome.runtime.sendMessage(m, () => {});
      resolve();
    });
  }

  async connect(): Promise<void> {
    let publicKey: PublicKey | null = null;

    try {
      if (this.connected || this.connecting) return;
      this._connecting = true;

      try {
        const res: {
          providerUrl: string;
          publicKey: Buffer;
        } = await this.sendInjectedMessage({
          type: "WALLET_CONNECT",
        });

        publicKey = new PublicKey(res.publicKey);

        await this.sendLocalMessage({
          type: "WALLET",
          data: {
            providerUrl: res.providerUrl,
            publicKey: {
              type: "String",
              data: new PublicKey(res.publicKey).toString(),
            },
          },
        });
      } catch (error) {
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
    console.log("wtf");
    console.log(this._publicKey);
    if (this._publicKey) {
      try {
        await this.sendInjectedMessage({ type: "WALLET_DISCONNECT" });
        await this.sendLocalMessage({
          type: "WALLET",
          data: {
            providerUrl: null,
            publicKey: null,
          },
        });
      } catch (error) {
        throw new WalletDisconnectionError();
      }
    }
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      if (!this._publicKey) throw new WalletNotConnectedError();

      try {
        return this.sendInjectedMessage({
          type: "WUMBO_signTransaction",
          data: transaction,
        });
      } catch (error) {
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
        return this.sendInjectedMessage({
          type: "WUMBO_signAllTransactions",
          data: transactions,
        });
      } catch (error) {
        throw new WalletSignatureError(error?.message, error);
      }
    } catch (error) {
      throw error;
    }
  }
}
