import React from "react";
import { Switch, Route } from "react-router-dom";
import Routes from "../../constants/routes";
import BetaSplash from "../BetaSplash/BetaSplash";
import { ClaimRoute } from "../Claim/Claim";
import { EditProfileRoute } from "../Profile/Edit/EditProfile";
import ManageWallet from "../Wallet/ManageWallet";
import Wallet from "../Wallet/Wallet";
import "./index.css";
import { ContextProviders } from "./ContextProviders";
import { ViewProfileRoute } from "../Profile/View/ViewProfile";
import { ViewNftRoute } from "../Nft/View/ViewNft"
import { WalletAutoReconnect } from "../../../../common/dist/lib";
import { TopTokens } from "../Leaderboard/TopTokens";
import { WumNetWorth } from "../Leaderboard/WumNetWorth";

const App: React.FC = () => (
  <ContextProviders>
    <WalletAutoReconnect />
    <Switch>
      <Route path={Routes.betaSplash.path} exact component={BetaSplash} />
      <Route path={Routes.claim.path} component={ClaimRoute} />
      <Route path={Routes.wallet.path} component={Wallet} />
      <Route path={Routes.manageWallet.path} component={ManageWallet} />
      <Route path={Routes.viewProfile.path} component={ViewProfileRoute} />
      <Route path={Routes.viewNft.path} component={ViewNftRoute} />
      <Route path={Routes.profile.path} exact component={ViewProfileRoute} />
      <Route path={Routes.editProfile.path} component={EditProfileRoute} />
      <Route path={Routes.topTokens.path} component={TopTokens} />
      <Route path={Routes.wumNetWorth.path} component={WumNetWorth} />
    </Switch>
  </ContextProviders>
);

export default App;
