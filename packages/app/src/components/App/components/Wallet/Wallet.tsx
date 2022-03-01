import { useWallet } from "@solana/wallet-adapter-react";
import { useFtxPayLink, Wallet } from "@strata-foundation/react";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import React from "react";
import { useHistory } from "react-router-dom";
import {
  AppRoutes,
  profilePath,
  wumNetWorthPath,
} from "../../../../constants/routes";
import { AppContainer } from "../common/AppContainer";
import WalletRedirect from "./WalletRedirect";

export default React.memo(() => {
  const solLink = useFtxPayLink();
  const { publicKey } = useWallet();
  const history = useHistory();

  return (
    <AppContainer>
      <WalletRedirect />
      <Wallet
        wumLeaderboardLink={publicKey ? wumNetWorthPath(publicKey) : ""}
        onSelect={(t: ITokenWithMetaAndAccount) => {
          if (t.account) {
            history.push(profilePath(t.account.mint));
          }
        }}
        solLink={solLink}
        onSendClick={() => history.push(AppRoutes.sendSearch.path)}
      />
    </AppContainer>
  );
});
