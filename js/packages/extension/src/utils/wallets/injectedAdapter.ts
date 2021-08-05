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

export enum MessageType {
  WALLET_CONNECT = "WALLET_CONNECT",
  WALLET_DISCONNECT = "WALLET_DISCONNECT",
  WALLET_RESET = "WALLET_RESET",
  SIGN_TRANSACTION = "SIGN_TRANSACTION",
  SIGN_TRANSACTIONS = "SIGN_TRANSACTIONS",
}

export type ConnectMessage = {
  type: MessageType.WALLET_CONNECT;
  providerUrl: string | null;
};

export type DisconnectMessage = {
  type: MessageType.WALLET_DISCONNECT;
};

export type SignTransactionMessage = {
  type: MessageType.SIGN_TRANSACTION;
  transaction: Buffer;
};

export type SignTransactionsMessage = {
  type: MessageType.SIGN_TRANSACTIONS;
  transactions: Buffer[];
};

export type ResetMessage = MessageEvent<{
  type: MessageType.WALLET_RESET;
}>;

export type Message =
  | ConnectMessage
  | DisconnectMessage
  | ResetMessage
  | SignTransactionMessage
  | SignTransactionsMessage;

export interface IInjectedWalletAdapterConfig {
  endpoint: string;
  publicKey: [
    PublicKey | null,
    React.Dispatch<React.SetStateAction<PublicKey | null>>
  ];
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

    const self = this;

    window.addEventListener("message", (e: MessageEvent<Message>) => {
      switch (e.data.type) {
        case MessageType.WALLET_RESET: {
          self._setPublicKey(null);
          self._setProviderUrl(null);
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

  async sendInjectedMessage(m: Message): Promise<any> {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();

      // TODO: fix any type
      messageChannel.port1.onmessage = (e: any) => resolve(e.data);
      window.postMessage(m, "*", [messageChannel.port2]);
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
          type: MessageType.WALLET_CONNECT,
          providerUrl: this._providerUrl,
        });

        publicKey = new PublicKey(res.publicKey);

        this._setPublicKey(publicKey);
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
    if (this._publicKey) {
      try {
        await this.sendInjectedMessage({ type: MessageType.WALLET_DISCONNECT });
        this._setPublicKey(null);
        this._setProviderUrl(null);
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

        const res = await this.sendInjectedMessage({
          type: MessageType.SIGN_TRANSACTION,
          transaction: transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          }),
        });

        this._setAwaitingApproval(false);
        return Transaction.from(res);
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
        this._setAwaitingApproval(true);

        const res = await this.sendInjectedMessage({
          type: MessageType.SIGN_TRANSACTIONS,
          transactions: transactions.map((t) =>
            t.serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            })
          ),
        });

        this._setAwaitingApproval(false);

        return res.map(Transaction.from);
      } catch (error) {
        throw new WalletSignatureError(error?.message, error);
      }
    } catch (error) {
      throw error;
    }
  }
}
