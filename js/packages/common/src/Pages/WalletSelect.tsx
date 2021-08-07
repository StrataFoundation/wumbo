import React, { Fragment, useEffect } from "react";
import { Wallet, WalletName } from "@solana/wallet-adapter-wallets";
import { useWallet } from "../utils/wallet";
import { WALLET_PROVIDERS } from "../constants/walletProviders";
import { Button, Alert } from "../";

export const WalletSelect = () => {
  const { connected, disconnect, select, connect } = useWallet();

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
            {WALLET_PROVIDERS.map((provider: Wallet, idx: number) => (
              <Button
                block
                key={idx}
                size="lg"
                color="primary"
                onClick={() => select(provider.name)}
              >
                <div className="flex flex-row w-full">
                  <img alt={`${provider.name}`} src={provider.icon} className="w-6 h-6 mr-4" />
                  {provider.name}
                </div>
              </Button>
            ))}
          </div>
          <Button block color="primary" onClick={connect}>
            Connect
          </Button>
        </div>
      )}
    </Fragment>
  );
};
