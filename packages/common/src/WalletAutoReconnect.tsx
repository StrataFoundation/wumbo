import React, { useEffect } from "react";
import { WalletName } from "@solana/wallet-adapter-wallets";
import { useLocalStorage } from "@strata-foundation/react";
import { useWallet } from "./contexts";
import { usePrevious } from "./utils";

export const WalletAutoReconnect: React.FC = () => {
  const { wallet, ready, select } = useWallet();
  const [name, setName] = useLocalStorage<WalletName | null>(
    "walletName",
    null
  );
  const lastWallet = usePrevious(wallet);

  useEffect(() => {
    if (!!lastWallet && !wallet) {
      // disconnected
      setName(null);
    } else {
      if (
        !wallet &&
        name &&
        [WalletName.Phantom, WalletName.Solflare, WalletName.Torus].includes(
          name
        )
      ) {
        select(name);
      } else if (wallet && wallet.name != name) {
        setName(wallet.name);
      }
    }
  }, [name, wallet, ready]);

  return null;
};
