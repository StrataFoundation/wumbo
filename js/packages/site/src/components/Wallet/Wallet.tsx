import React, { useEffect } from "react";
import AppContainer from "../common/AppContainer";
import { useHistory } from "react-router-dom";
import { useQuery, useWallet, WalletSelect, WalletCoins } from "wumbo-common";

export default React.memo(() => {
  const history = useHistory();
  const query = useQuery();
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const redirect = query.get("redirect");
    if (connected && redirect) {
      console.log(`Redirecting to ${redirect}`);
      history.push(redirect);
    }
  }, [connected, query.get("redirect"), history]);

  return (
    <AppContainer>
      {publicKey ? <WalletCoins publicKey={publicKey} /> : <WalletSelect />}
    </AppContainer>
  );
});
