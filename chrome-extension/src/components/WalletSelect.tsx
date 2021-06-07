import React from "react"
import { useWallet } from "../utils/wallet"
import { WALLET_PROVIDERS } from "../constants/walletProviders"
import { WalletProvider } from "@solana/wallet-base"
import { Alert, Button } from "antd"

export function WalletSelect({ setShowWalletConnect }: any) {
  const { connect, setProviderUrl, setAutoConnect, error } = useWallet()

  return (
    <div className="wallet-select">
      <button
        className="back-button"
        onClick={() => {
          setShowWalletConnect(false)
        }}
      >
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAMBAMAAABcu7ojAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAeUExURays/5aX/5aX/0dwTJWY/5mZ/5ub/5aW/5aY/5aX/zRlE08AAAAJdFJOUwi1ZABvQClOlAcheZQAAAA/SURBVAjXYzA25ghgMDaQLGAwZpxkwGAgqWzAwDjJ2IBB0hlIaAoACaOJzAYMxpoCQMJoIgODsbGmA5AwZQAAI4wJgGTpaD4AAAAASUVORK5CYII=" />
      </button>
      <h1>Connect your wallet</h1>
      <p>
        New to Crypto & dont have an existing wallet?{" "}
        <a href="https://www.sollet.io/">Get one here.</a>
      </p>
      <div className="wallets">
        {WALLET_PROVIDERS.map((provider: WalletProvider, idx: number) => {
          const onClick = function () {
            setProviderUrl(provider.url)
            setAutoConnect(true)
          }

          return (
            <Button
              key={idx}
              size="large"
              type="primary"
              className="wallet-button"
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
          )
        })}
      </div>
      {error && <Alert type="error" message={error.toString()} />}
    </div>
  )
}
