import React from "react";
import { Switch, Route } from "react-router-dom";
import { SiteRoutes } from "../../constants/routes";
import { LandingPage } from "./pages/Landing";
import { TutorialPage } from "./pages/Tutorial";

import { BetaDownlaodModal } from "./components/modals/BetaDownloadModal";
import Header from "./components/sections/Header";

export const Site = () => (
  <React.Fragment>
    <Header zIndex="1" />
    <Switch>
      <Route path={SiteRoutes.tutorial.path} component={TutorialPage} />
      <Route path={SiteRoutes.root.path} component={LandingPage} />
    </Switch>

    {/* place site specific modals here */}
    <BetaDownlaodModal />
  </React.Fragment>
);
