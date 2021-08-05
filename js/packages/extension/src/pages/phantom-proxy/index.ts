import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Wallet } from "@solana/wallet-adapter-wallets";
import { Transaction } from "@solana/web3.js";
import { WALLET_PROVIDERS } from "wumbo-common";
import {
  MessageType,
  Message,
  ConnectMessage,
  SignTransactionMessage,
  SignTransactionsMessage,
} from "../../utils/wallets/injectedAdapter";

const getProvider = (providerUrl: string): Wallet | undefined =>
  WALLET_PROVIDERS.find((p) => p.url == providerUrl);

let adapter: WalletAdapter | undefined;

(window as Window).addEventListener(
  "message",
  async (e) => {
    if (e.data.type && e.ports) {
      const sendReply = (data: any) => e.ports[0].postMessage(data);

      switch ((e.data as Message).type) {
        case MessageType.WALLET_CONNECT: {
          const {
            data: { providerUrl },
          } = e as MessageEvent<ConnectMessage>;

          // TODO: fix ! on providerUrl
          const provider = getProvider(providerUrl!);
          adapter = provider?.adapter();

          adapter?.on("connect", () => {
            sendReply({
              publicKey: adapter!.publicKey!.toBuffer(),
              providerUrl: provider?.url,
            });
          });

          // fail safe for any reasons it disconnects
          adapter?.on("disconnect", () => {
            // TODO: fix '*'
            window.postMessage({ type: MessageType.WALLET_RESET }, "*");
          });

          adapter?.connect();
          break;
        }

        case MessageType.SIGN_TRANSACTION: {
          const {
            data: { transaction },
          } = e as MessageEvent<SignTransactionMessage>;
          const unsigned = Transaction.from(transaction);

          const signed = await adapter?.signTransaction(unsigned);

          sendReply(
            signed!.serialize({
              verifySignatures: false,
              requireAllSignatures: false,
            })
          );
          break;
        }

        case MessageType.SIGN_TRANSACTIONS: {
          const {
            data: { transactions },
          } = e as MessageEvent<SignTransactionsMessage>;
          const unsigned = transactions.map(Transaction.from);

          const signed = await adapter?.signAllTransactions(unsigned);

          sendReply(
            signed!.map((signedT) =>
              signedT.serialize({
                verifySignatures: false,
                requireAllSignatures: false,
              })
            )
          );
          break;
        }

        case MessageType.WALLET_DISCONNECT: {
          adapter?.on("disconnect", () => sendReply(true));
          adapter?.disconnect();
          adapter = undefined;
          break;
        }
      }
    }
  },
  false
);
