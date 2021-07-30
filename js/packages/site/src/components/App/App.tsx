import React from "react";
import { Switch, Route } from "react-router-dom";
import Routes from "../../constants/routes";
import BetaSplash from "../BetaSplash/BetaSplash";
import { ClaimRoute } from "../Claim/Claim";
import { EditProfileRoute } from "../Profile/Edit/EditProfile";
import Wallet from "../Wallet/Wallet";
import "./index.css";
import { ContextProviders } from "./ContextProviders";
import { ViewProfileRoute } from "../Profile/View/ViewProfile";

const App: React.FC = () => (
  <ContextProviders>
    <Switch>
      <Route path={Routes.betaSplash.path} exact component={BetaSplash} />
      <Route path={Routes.claim.path} component={ClaimRoute} />
      <Route path={Routes.wallet.path} component={Wallet} />
      <Route path={Routes.profile.path} component={ViewProfileRoute} />
      <Route path={Routes.editProfile.path} component={EditProfileRoute} />
    </Switch>
  </ContextProviders>
);

export default App;
