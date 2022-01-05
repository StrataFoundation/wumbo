import "./wdyr";
import "./bufferFill";
import React from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "wumbo-common";
import { ModalProvider } from "./contexts";
import { SiteRoutes, AppRoutes } from "./constants/routes";
import { App } from "./components/App/App";
import { Site } from "./components/Site/Site";
import reportWebVitals from "./reportWebVitals";

const TRACKING_ID = "G-3K3X1TLYCC";
ReactGA.initialize(TRACKING_ID);
ReactGA.pageview(window.location.pathname + window.location.search);

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <ModalProvider>
        <BrowserRouter>
          <Switch>
            <Route path={AppRoutes.root.path} component={App} />
            <Route path={SiteRoutes.root.path} component={Site} />
          </Switch>
        </BrowserRouter>
      </ModalProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
