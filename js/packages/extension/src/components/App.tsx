import React, { FC } from "react";
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";

import { routes, paths } from "@/constants/routes";
import { ContextProviders } from "./ContextProviders";
import { WumboDrawer } from "./WumboDrawer";

import { Twitter } from "./twitter/Twitter";
import { NftEnhancer } from "./nft/NftEnhancer";

import { Create } from "./create/Create";
import { TradeRoute } from "./trade/Trade";
import { Wallet } from "./wallet/Wallet";
import { ManageWallet } from "./wallet/ManageWallet";
import { ViewNft } from "./nft/ViewNft";
import { TagNft } from "./nft/TagNft";
import { Profile } from "./profile/Profile";
import Claim from "./claim/Claim";
import { EditProfileRoute } from "./profile/EditProfile";

const App: FC = () => (
  <Router initialEntries={[routes.myTokens.path]} initialIndex={0}>
    <ContextProviders>
      <NftEnhancer />
      <Twitter />

      <WumboDrawer>
        <Switch>
          <Route path={routes.create.path} component={Create} />
          <Route path={routes.claim.path} component={Claim} />
          <Route path={routes.trade.path} component={TradeRoute} />
          <Route path={routes.myTokens.path} component={Wallet} />
          <Route path={routes.manageWallet.path} component={ManageWallet} />
          <Route path={routes.viewProfile.path} component={Profile} />
          <Route path={routes.viewNft.path} component={ViewNft} />
          <Route path={routes.tagNft.path} component={TagNft} />
          <Route path={routes.editProfile.path} component={EditProfileRoute} />
          <Route path={routes.profile.path} exact component={Profile} />
        </Switch>
      </WumboDrawer>
    </ContextProviders>
  </Router>
);

export default App;
