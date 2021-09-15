import React, { Fragment } from "react";
import { Wallet } from "@solana/wallet-adapter-wallets";
import { useWallet } from "../contexts/walletContext";
import { WALLET_PROVIDERS } from "../constants/walletProviders";
import { Button } from "../";

export const WalletSelect = () => {
  const { connected, disconnect, select } = useWallet();

  return (
    <div className="p-4">
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
        </div>
      )}
    </div>
  );
};
