import {
  WalletNotInstalledError,
  WalletNotFoundError,
  WalletAdapter,
} from "@solana/wallet-adapter-base";

const providerUrl = "https://phantom.app/";

const getProvider = (): WalletAdapter | undefined => {
  if ("solana" in window) {
    const provider = (window as any).solana;

    if (!provider) throw new WalletNotFoundError();
    if (!provider.isPhantom) throw new WalletNotInstalledError();

    return provider;
  }

  window.open(providerUrl, "_blank");
};

(window as Window).addEventListener(
  "message",
  (e) => {
    if (e.data.type && e.ports) {
      const sendReply = (data: any) => e.ports[0].postMessage(data);

      switch (e.data.type) {
        case "WALLET_CONNECT": {
          const provider = getProvider();
          provider?.on("connect", () =>
            sendReply({
              publicKey: provider?.publicKey?.toBuffer(),
              providerUrl,
            })
          );
          provider?.connect();
          break;
        }

        case "WALLET_DISCONNECT": {
          const provider = getProvider();
          provider?.on("disconnect", () => sendReply(true));
          provider?.disconnect();
          break;
        }
      }
    }
  },
  false
);
