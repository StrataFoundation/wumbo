import React from "react";
import { Switch, Route } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import { Header } from "./components/common/Header";
import { Workspace } from "./components/common/Workspace";
import { AppContainer } from "./components/common/AppContainer";
import { Toaster } from "react-hot-toast";
import { AppRoutes } from "../../constants/routes";
import { ClaimRoute } from "./components/Claim/Claim";
import { EditProfileRoute } from "./components/Profile/Edit/EditProfile";
import ManageWallet from "./components/Wallet/ManageWallet";
import Wallet from "./components/Wallet/Wallet";
import Send from "./components/Wallet/Send";
import SendSearch from "./components/Wallet/SendSearch";
import { ContextProviders } from "./ContextProviders";
import { ViewProfileRoute } from "./components/Profile/View/ViewProfile";
import { ViewNftRoute } from "./components/Nft/View/ViewNft";
import { TopTokens } from "./components/Leaderboard/TopTokens";
import { WumNetWorth } from "./components/Leaderboard/WumNetWorth";
import { SwapRoute } from "./components/Swap/Swap";
import { PrototypeRoute } from "./components//Prototype";

export const App = () => (
  <Flex w="full" h="100vh" flexDirection="column">
    <Header />

    <Workspace>
      <AppContainer>
        <Switch>
          <Route path={AppRoutes.claim.path} component={ClaimRoute} />
          <Route path={AppRoutes.wallet.path} component={Wallet} />
          <Route
            path={AppRoutes.manageWallet.path}
            component={ManageWallet}
          />
          <Route
            path={AppRoutes.viewProfile.path}
            component={ViewProfileRoute}
          />
          <Route path={AppRoutes.viewNft.path} component={ViewNftRoute} />
          <Route
            path={AppRoutes.profile.path}
            exact
            component={ViewProfileRoute}
          />
          <Route
            path={AppRoutes.editProfile.path}
            component={EditProfileRoute}
          />
          <Route path={AppRoutes.topTokens.path} component={TopTokens} />
          <Route path={AppRoutes.wumNetWorth.path} component={WumNetWorth} />
          <Route
            path={AppRoutes.sendSearch.path}
            exact
            component={SendSearch}
          />
          <Route path={AppRoutes.send.path} component={Send} />
          <Route path={AppRoutes.swap.path} component={SwapRoute} />
          <Route path={AppRoutes.prototype.path} component={PrototypeRoute} />
        </Switch>
      </AppContainer>
      <Toaster
        position="bottom-center"
        containerStyle={{
          margin: "auto",
          width: "420px",
        }}
      />
    </Workspace>
  </Flex>
);
