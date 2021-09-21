import React, { useEffect } from "react";
import AppContainer from "../common/AppContainer";
import { useHistory } from "react-router-dom";
import { Wallet } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";

export default React.memo(() => {
  return (
    <AppContainer>
      <WalletRedirect />
      <Wallet />
    </AppContainer>
  );
});
