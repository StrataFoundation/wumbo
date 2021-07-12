import React from "react";
import { Switch, Route } from "react-router-dom";
import Routes from "../../constants/routes";
import BetaSplash from "../BetaSplash/BetaSplash";

const App: React.FC = () => (
  <Switch>
    <Route path={Routes.betaSplash.path} component={BetaSplash} />
  </Switch>
);

export default App;
