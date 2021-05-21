import React from "react";
import {useWallet} from "../../utils/wallet";
import {WALLET_PROVIDERS} from "../../constants/walletProviders";
import {Button} from "antd";
import {WalletProvider} from "@solana/wallet-base";

export default () => {
  const { setProviderUrl, setAutoConnect } = useWallet();

  return (
    <>
      {WALLET_PROVIDERS.map((provider: WalletProvider, idx: number) => {
        const onClick = function () {
          setProviderUrl(provider.url);
          setAutoConnect(true);
          close();
        };

        return (
          <Button
            key={idx}
            size="large"
            type="primary"
            onClick={onClick}
            icon={
              <img
                alt={`${provider.name}`}
                width={20}
                height={20}
                src={provider.icon}
                style={{ marginRight: 8 }}
              />
            }
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              marginBottom: 8,
            }}
          >
            {provider.name}
          </Button>
        );
      })}
    </>
  );
};
