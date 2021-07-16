import React from "react";
import { Switch, Route } from "react-router-dom";
import Routes from "../../constants/routes";
import BetaSplash from "../BetaSplash/BetaSplash";
import {ClaimRoute} from "../Claim/Claim";
import Wallet from "../Wallet/Wallet";
import "./index.css"
import { ContextProviders } from "./ContextProviders";

const App: React.FC = () => (
  <ContextProviders>
    <Switch>
      <Route path={Routes.betaSplash.path} exact component={BetaSplash} />
      <Route path={Routes.claim.path} component={ClaimRoute} />
      <Route path={Routes.wallet.path} component={Wallet} />
    </Switch>
  </ContextProviders>
);

export default App;
