import React, { Fragment, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useLastLocation } from "react-router-last-location";
import { WalletProvider } from "@solana/wallet-base";
import { useWallet } from "@/utils/wallet";
import { WALLET_PROVIDERS } from "@/constants/walletProviders";
import { Button, Alert } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";
import { routes } from "@/constants/routes";
import { usePrevious } from "@/utils/utils";

export const Wallet = () => {
  const history = useHistory();
  const lastLocation = useLastLocation();
  const { connect, disconnect, wallet, setProviderUrl, setAutoConnect, error } =
    useWallet();
  const prevWallet = usePrevious(wallet);

  useEffect(() => {
    /*
     ** if we're connecting a wallet for the first time and
     ** have navigated away from the create or trade screen
     ** then nevigate back after connecting
     */
    if (wallet && wallet.publicKey && prevWallet && !prevWallet.publicKey) {
      if (
        lastLocation?.pathname &&
        [routes.create.path, routes.trade.path].includes(lastLocation.pathname)
      ) {
        history.push(lastLocation.pathname);
      }
    }
  }, [wallet, lastLocation, prevWallet, history]);

  return (
    <Fragment>
      <WumboDrawer.Header title="Wallet" />
      <WumboDrawer.Content>
        {wallet && wallet.publicKey ? (
          <div className="flex flex-col space-y-4 px-4">
            <span className="test-sm">Wallet Connected!</span>
            <Button
              block
              size="lg"
              color="primary"
              onClick={() => console.log("TODO: disconnect")}
            >
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
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
