import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { WalletSelect } from "wumbo-common";
import { useWallet } from "@solana/wallet-adapter-react";
import { AppContainer } from "../common/AppContainer";

export default React.memo(() => {
  const history = useHistory();
  const location = useLocation();
  const { connected } = useWallet();

  useEffect(() => {
    const redirect = location.search.replace("?redirect=", "");
    if (connected && redirect) {
      console.log(`Redirecting to ${redirect}`);
      history.replace(redirect);
    }
  }, [connected, location, history]);

  return (
    <AppContainer>
      <WalletSelect />
    </AppContainer>
  );
});
