import React from "react";
import { Switch, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Routes from "../../constants/routes";
import BetaSplash from "../BetaSplash/BetaSplash";
import { ClaimRoute } from "../Claim/Claim";
import { EditProfileRoute } from "../Profile/Edit/EditProfile";
import ManageWallet from "../Wallet/ManageWallet";
import Wallet from "../Wallet/Wallet";
import { ContextProviders } from "./ContextProviders";
import { ViewProfileRoute } from "../Profile/View/ViewProfile";
import { ViewNftRoute } from "../Nft/View/ViewNft";
import { TopTokens } from "../Leaderboard/TopTokens";
import { WumNetWorth } from "../Leaderboard/WumNetWorth";
import Send from "../Wallet/Send";
import SendSearch from "../Wallet/SendSearch";
import { SwapRoute } from "../Swap/Swap";
import { PrototypeRoute } from "../Prototype";
import { WalletAutoReconnect } from "wumbo-common";

const App: React.FC = () => (
  <ContextProviders>
    <WalletAutoReconnect />
    <Switch>
      <Route path={Routes.betaSplash.path} exact component={BetaSplash} />
      <Route path={Routes.claim.path} component={ClaimRoute} />
      <Route path={Routes.wallet.path} component={Wallet} />
      <Route path={Routes.manageWallet.path} component={ManageWallet} />
      <Route path={Routes.viewProfile.path} component={ViewProfileRoute} />
      <Route path={Routes.viewNft.path} component={ViewNftRoute} />
      <Route path={Routes.profile.path} exact component={ViewProfileRoute} />
      <Route path={Routes.editProfile.path} component={EditProfileRoute} />
      <Route path={Routes.topTokens.path} component={TopTokens} />
      <Route path={Routes.wumNetWorth.path} component={WumNetWorth} />
      <Route path={Routes.sendSearch.path} exact component={SendSearch} />
      <Route path={Routes.send.path} component={Send} />
      <Route path={Routes.swap.path} component={SwapRoute} />
      <Route path={Routes.prototype.path} component={PrototypeRoute} />
    </Switch>
    <Toaster
      position="bottom-center"
      containerStyle={{
        margin: "auto",
        width: "420px",
      }}
    />
  </ContextProviders>
);

export default App;
