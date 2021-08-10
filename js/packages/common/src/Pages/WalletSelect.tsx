import React, { Fragment, useEffect, useState } from "react";
import { Wallet, WalletName } from "@solana/wallet-adapter-wallets";
import { useWallet } from "../utils";
import { WALLET_PROVIDERS } from "../constants/walletProviders";
import { Button, Alert } from "../";

export const WalletSelect = () => {
  const { connected, disconnect, select, error } = useWallet();

  return (
    <Fragment>
      {connected ? (
        <div className="wum-flex wum-flex-col wum-space-y-4 wum-px-4">
          <span className="wum-test-sm">Wallet Connected!</span>
          <Button block size="lg" color="primary" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="wum-flex wum-flex-col wum-space-y-4 wum-px-4">
          <span className="wum-test-sm">
            New to Crypto & dont have an existing wallet?
            <br />
            <a href="https://www.sollet.io" className="wum-text-purple-600">
              Get one here.
            </a>
          </span>
          <div className="wum-grid wum-grid-flow-row wum-gap-4">
            {WALLET_PROVIDERS.map((provider: Wallet, idx: number) => (
              <Button
                block
                key={idx}
                size="lg"
                color="primary"
                onClick={() => select(provider.name)}
              >
                <div className="wum-flex wum-flex-row wum-w-full">
                  <img
                    alt={`${provider.name}`}
                    src={provider.icon}
                    className="wum-w-6 wum-h-6 wum-mr-4"
                  />
                  {provider.name}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="wum-mt-4">
          <Alert type="error" message={error.toString()} />
        </div>
      )}
    </Fragment>
  );
};
