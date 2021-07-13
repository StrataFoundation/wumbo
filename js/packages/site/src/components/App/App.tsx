import React from "react";
import { Switch, Route } from "react-router-dom";
import Routes from "../../constants/routes";
import BetaSplash from "../BetaSplash/BetaSplash";
import Claim from "../Claim/Claim";
import "./index.css"

const App: React.FC = () => (
  <Switch>
    {/* <Route path={Routes.betaSplash.path} component={BetaSplash} /> */}
    <Claim />
    {/* <Route path={Routes.claim.path} component={Claim} /> */}
  </Switch>
);

export default App;
