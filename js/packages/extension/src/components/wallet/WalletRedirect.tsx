import React, { useEffect } from "react";
import { Redirect, useLocation } from "react-router";
import { useLocalStorage, useWallet } from "wumbo-common";
import { routes } from "../../constants/routes";
import { WalletName } from "@solana/wallet-adapter-wallets";

export default React.memo(() => {
  const location = useLocation();
  const { wallet, connected, ready, select } = useWallet();
  const [name, setName] = useLocalStorage<WalletName | null>("walletName", null);
  useEffect(() => {
    if (!wallet && name && [WalletName.Phantom, WalletName.Solflare, WalletName.Torus].includes(name)) {
      select(name)
    } else if (wallet && wallet.name != name) {
      setName(wallet.name)
    }
  }, [name, wallet])

  const redirectUri = routes.wallet.path + `?redirect=${location.pathname}${location.search}`;

  if (!connected) {
    return <Redirect to={redirectUri} />;
  }

  return null;
});
