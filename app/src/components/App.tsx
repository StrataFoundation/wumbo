import React from "react";
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import { routes, paths } from "@/constants/routes";
import { ContextProviders } from "./ContextProviders";
import { WumboDrawer } from "./WumboDrawer";

import TweetEnhancements from "./TweetEnhancements";
import { Create } from "./create/Create";
import { Customize } from "./customize/Customize";
import { Trade } from "./trade/Trade";
import { TradeWUM } from "./trade/TradeWUM";
import { MyCoins } from "./my-coins/MyCoins";
import { Wallet } from "./wallet/Wallet";
import { Search } from "./search/Search";
import { Profile } from "./profile/Profile";

const App: React.FC = () => (
  <Router initialEntries={paths} initialIndex={0}>
    <ContextProviders>
      <TweetEnhancements />

      <WumboDrawer>
        <Switch>
          <Route path={routes.create.path} component={Create} />
          <Route path={routes.customize.path} component={Customize} />
          <Route path={routes.trade.path} component={Trade} />
          <Route path={routes.tradeWUM.path} component={TradeWUM} />
          <Route path={routes.myCoins.path} component={MyCoins} />
          <Route path={routes.wallet.path} component={Wallet} />
          <Route path={routes.search.path} component={Search} />
          <Route path={routes.profile.path} component={Profile} />
        </Switch>
      </WumboDrawer>
    </ContextProviders>
  </Router>
);

export default App;
