import React, { Fragment } from "react";
import { WalletProvider } from "@solana/wallet-base";
import { ChevronLeftIcon } from "@heroicons/react/solid";
import { useWallet } from "@/utils/wallet";
import { WALLET_PROVIDERS } from "@/constants/walletProviders";
import { Button, Alert } from "wumbo-common";

interface WalletSelectProps {
  setShowWalletConnect: (arg0: boolean) => void;
}

export const WalletSelect = ({ setShowWalletConnect }: WalletSelectProps) => {
  const { connect, setProviderUrl, setAutoConnect, error } = useWallet();

  return (
    <Fragment>
      <div className="flex flex-row">
        <ChevronLeftIcon
          className="cursor-pointer w-8 h-8 text-purple-700 mr-2"
          onClick={() => setShowWalletConnect(false)}
        />
        <span className="text-lg">Connect your wallet</span>
      </div>
      <div className="flex flex-col space-y-4 px-10">
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
                key={idx}
                size="md"
                color="primary"
                onClick={onClick}
                block
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
      {error && (
        <div className="mt-4">
          <Alert type="error" message={error.toString()} />
        </div>
      )}
    </Fragment>
  );
};
