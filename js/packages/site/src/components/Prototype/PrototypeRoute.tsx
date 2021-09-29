import React from "react";
import AppContainer from "../common/AppContainer";
import { Swap } from "wumbo-common";

// used for prototypeing quickly on the site
// add whatever components you want inside of the AppContainer
// start the site and nav to /prototype
export const PrototypeRoute = React.memo(() => (
  <AppContainer>
    <Swap />
  </AppContainer>
));
