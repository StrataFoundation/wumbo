import { useConnectionConfig } from "@oyster/common";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "@oyster/common";
import { WalletContext, WALLET_PROVIDERS } from "wumbo-common";

export function WalletProvider({ children = null as any }) {
  const { endpoint } = useConnectionConfig();
  const [providerUrl, setProviderUrl] = useLocalStorageState("walletProvider");
  const [connected, setConnected] = useState<boolean>();
  const [autoConnect, setAutoConnect] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState<boolean>(false);
  const wallet = useMemo(
    function () {
      if (providerUrl && endpoint) {
        const adapter = WALLET_PROVIDERS.find((p) => p.url == providerUrl);
        // @ts-ignore
        return new adapter.adapter(providerUrl, endpoint);
      }
    },
    [providerUrl, endpoint]
  );

  useEffect(() => {
    if (wallet) {
      wallet.on("connect", () => {
        if (wallet.publicKey) {
          setConnected(true);
        }
      });

      wallet.on("disconnect", () => {
        setConnected(false);
      });
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet && autoConnect) {
      wallet.connect();
      setAutoConnect(false);
    }
  }, [wallet, autoConnect]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        provider: WALLET_PROVIDERS.find((p) => p.url == providerUrl),
        connected: !!connected,
        setAutoConnect,
        setProviderUrl,
        awaitingApproval: !!awaitingApproval,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
