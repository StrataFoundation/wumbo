import { WalletName } from "@solana/wallet-adapter-wallets";
import React, { useEffect } from "react";
import { useWallet } from "./contexts";
import { useLocalStorage, usePrevious } from "./utils";

export const WalletAutoReconnect: React.FC = () => {
  const { wallet, disconnecting, connected, ready, select } = useWallet();
  const [name, setName] = useLocalStorage<WalletName | null>("walletName", null);
  const lastWallet = usePrevious(wallet);

  useEffect(() => {
    if (!!lastWallet && !wallet) { // disconnected
      setName(null);
    } else {
      if (!wallet && name && [WalletName.Phantom, WalletName.Solflare, WalletName.Torus].includes(name)) {
        select(name)
      } else if (wallet && wallet.name != name) {
        setName(wallet.name)
      }
    }
  }, [name, wallet, disconnecting])

  return null;
}