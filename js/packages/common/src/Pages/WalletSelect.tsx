import React, { Fragment, useEffect } from "react";
import { WalletProvider } from "@solana/wallet-base";
import { useWallet } from "../utils/wallet";
import { WALLET_PROVIDERS } from "../constants/walletProviders";
import { Button, Alert } from "../";

export const WalletSelect = React.memo(() => {
  const {
    connected,
    disconnect,
    wallet,
    setProviderUrl,
    setAutoConnect,
    error,
  } = useWallet();
  return (
    <Fragment>
      {connected ? (
        <div className="flex flex-col space-y-4 px-4">
          <span className="test-sm">Wallet Connected!</span>
          <Button block size="lg" color="primary" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-4 px-4">
          <span className="test-sm">
            New to Crypto & dont have an existing wallet?
            <br />
            <a href="https://www.sollet.io" className="text-purple-600">
              Get one here.
            </a>
          </span>
          <div className="grid grid-flow-row gap-4">
            {WALLET_PROVIDERS.map((provider: WalletProvider, idx: number) => {
              const onClick = function () {
                setProviderUrl(provider.url);
                setAutoConnect(true);
              };

              return (
                <Button
                  block
                  key={idx}
                  size="lg"
                  color="primary"
                  onClick={onClick}
                >
                  <div className="flex flex-row w-full">
                    <img
                      alt={`${provider.name}`}
                      src={provider.icon}
                      className="w-6 h-6 mr-4"
                    />
                    {provider.name}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error.toString()} />
        </div>
      )}
    </Fragment>
  );
});
