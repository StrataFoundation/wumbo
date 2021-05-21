// import {WALLET_PROVIDERS} from "./utils/wallet";
import {WalletAdapter} from "@solana/wallet-base";
import {WALLET_PROVIDERS} from "./constants/walletProviders";
import {Transaction} from "@solana/web3.js";

let publicKey: Buffer | null = null;
let walletAdapter: WalletAdapter | null = null;

function sendWallet() {
  const msg = { data: { publicKey: publicKey }, type: "WALLET" };
  chrome.runtime.sendMessage(msg, () => {});
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  (async () => {
    if (msg.type == "WALLET_CONNECT") {
      const adapter = WALLET_PROVIDERS.find(
        (p) => p.url == msg.data.providerUrl
      );
      if (!adapter) {
        sendResponse({
          error: new Error(`No adapter for ${msg.data.providerUrl}`),
        });
        return;
      }

      // @ts-ignore
      walletAdapter = new adapter.adapter(
        adapter.url,
        msg.data.endpoint
      ) as WalletAdapter;

      walletAdapter.connect().catch((error: Error) => sendResponse({ error }));

      walletAdapter.on("connect", () => {
        if (walletAdapter && walletAdapter.publicKey) {
          publicKey = walletAdapter.publicKey.toBuffer();
        }
        sendWallet();
        sendResponse({ data: { publicKey: publicKey } });
      });

      walletAdapter.on("disconnect", () => {
        publicKey = null;
        walletAdapter = null;
        sendWallet();
      });
    }
    if (msg.type == "WALLET_DISCONNECT") {
      walletAdapter = null;
      publicKey = null;
      chrome.runtime.sendMessage({ type: "WALLET", data: {} });
      sendResponse({ type: "WALLET", data: {} });
    }

    if (msg.type == "SIGN_TRANSACTION") {
      if (!walletAdapter) {
        sendResponse({ error: new Error(`No wallet connected`) });
        return;
      }
      const transaction = await walletAdapter.signTransaction(
        Transaction.from(msg.data.transaction)
      );
      sendResponse(transaction.serialize());
    }

    if (msg.type == "SIGN_TRANSACTIONS") {
      if (!walletAdapter) {
        sendResponse({ error: new Error(`No wallet connected`) });
        return;
      }
      const transactions = msg.data.transactions.map(Transaction.from);
      const ret = await walletAdapter.signAllTransactions(transactions);
      sendResponse(ret.map((transaction) => transaction.serialize()));
    }
  })();

  return true;
});

// Route WALLET messages to popup
chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name == "popup");
  const listener = function (msg: any) {
    if (msg.type == "WALLET") {
      port.postMessage(msg);
    }
    return true;
  };
  chrome.runtime.onMessage.addListener(listener);
  port.onDisconnect.addListener(() =>
    chrome.runtime.onMessage.removeListener(listener)
  );
  return true;
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type == "LOAD_WALLET") {
    sendResponse({ type: "WALLET", data: { publicKey } });
  }
  return true;
});
