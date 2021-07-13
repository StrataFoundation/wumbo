import React from "react";
import { Switch, Route } from "react-router-dom";
import Routes from "../../constants/routes";
import BetaSplash from "../BetaSplash/BetaSplash";
import Claim from "../Claim/Claim";
import "./index.css"
import { ContextProviders } from "./ContextProviders";

const App: React.FC = () => (
  <ContextProviders>
    <Switch>
      {/* <Route path={Routes.betaSplash.path} component={BetaSplash} /> */}
      <Claim />
      {/* <Route path={Routes.claim.path} component={Claim} /> */}
    </Switch>
  </ContextProviders>
);

export default App;
