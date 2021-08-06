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
