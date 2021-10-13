import React from "react";
import { Switch, Route } from "react-router-dom";
import { SiteRoutes } from "../../constants/routes";
import { Home } from "./components/Home";

import { BetaDownlaodModal } from "./components/modals/BetaDownloadModal";

export const Site = () => (
  <React.Fragment>
    <Switch>
      <Route path={SiteRoutes.root.path} component={Home} />
    </Switch>

    {/* place site specific modals here */}
    <BetaDownlaodModal />
  </React.Fragment>
);
