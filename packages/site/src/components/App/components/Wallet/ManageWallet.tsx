import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useQuery, WalletSelect } from "wumbo-common";
import { useWallet } from "@solana/wallet-adapter-react";

export default React.memo(() => {
  const history = useHistory();
  const query = useQuery();
  const { connected } = useWallet();

  useEffect(() => {
    const redirect = query.get("redirect");
    if (connected && redirect) {
      console.log(`Redirecting to ${redirect}`);
      history.replace(redirect);
    }
  }, [connected, query.get("redirect"), history]);

  return <WalletSelect />;
});
