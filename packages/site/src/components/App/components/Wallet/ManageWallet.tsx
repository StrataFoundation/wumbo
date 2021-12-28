import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useQuery, WalletSelect } from "wumbo-common";
import { useWallet } from "@solana/wallet-adapter-react";

export default React.memo(() => {
  const history = useHistory();
  const query = useQuery();
  const { connected } = useWallet();
  const redirect = query.get("redirect");

  useEffect(() => {
    if (connected && redirect) {
      console.log(`Redirecting to ${redirect}`);
      history.replace(redirect);
    }
  }, [connected, redirect, history]);

  return <WalletSelect />;
});
