import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { useAsync } from "react-async-hook";
import { sleep } from "wumbo-common";

const MAX_TRIES = 10;

let globalReady = false;
async function waitForReady(adapter: any): Promise<boolean> {
  if (globalReady) {
    return true;
  }

  let tries = 0;
  while (
    adapter &&
    adapter.readyStateAsync &&
    tries < MAX_TRIES &&
    !globalReady
  ) {
    const ready = await adapter.readyStateAsync();
    if (ready == "ProxyNotReady") {
      console.log("Wallet not ready, trying again...");
      await sleep(500);
    } else {
      console.log("Wallet ready!");
      globalReady = true;
      return true;
    }
  }

  return globalReady;
}

export const WalletAutoConnect = () => {
  const { connected, connecting, wallet, connect } = useWallet();
  const { result: ready } = useAsync(waitForReady, [wallet?.adapter]);

  useEffect(() => {
    if (
      !ready ||
      connecting ||
      connected ||
      !wallet?.adapter ||
      !(
        wallet.readyState === WalletReadyState.Installed ||
        wallet.readyState === WalletReadyState.Loadable
      )
    )
      return;
    connect();
  }, [ready, connecting, connected, wallet, connect]);

  return null;
};
