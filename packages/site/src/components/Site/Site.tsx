import React from "react";
import { Switch, Route } from "react-router-dom";
import { SiteRoutes } from "../../constants/routes";
import { Landing } from "./pages/Landing";

import { BetaDownlaodModal } from "./components/modals/BetaDownloadModal";

export const Site = () => (
  <React.Fragment>
    <Switch>
      <Route path={SiteRoutes.root.path} component={Landing} />
    </Switch>

    {/* place site specific modals here */}
    <BetaDownlaodModal />
  </React.Fragment>
);
