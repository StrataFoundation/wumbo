import React from "react";
import { Switch, Route } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import { Header } from "./components/common/Header";
import { Workspace } from "./components/common/Workspace";
import { Toaster } from "react-hot-toast";
import { AppRoutes } from "../../constants/routes";
import { ClaimRoute } from "./components/Claim/Claim";
import { OptOutRoute } from "./components/Claim/OptOut";
import { ClaimedOptOutRoute } from "./components/Claim/ClaimedOptOut";
import { EditProfileRoute } from "./components/Profile/Edit/EditProfile";
import ManageWallet from "./components/Wallet/ManageWallet";
import Wallet from "./components/Wallet/Wallet";
import Send from "./components/Wallet/Send";
import SendSearch from "./components/Wallet/SendSearch";
import { ViewProfileRoute } from "./components/Profile/View/ViewProfile";
import { ViewNftRoute } from "./components/Nft/View/ViewNft";
import { SwapRoute } from "./components/Swap/Swap";
import { PrototypeRoute } from "./components//Prototype";
import { ContextProviders } from "./ContextProviders";

import { WalletSelectModal } from "./components/modals/WalletSelectModal";

export const App: React.FC = () => (
  <ContextProviders>
    <Flex w="full" h="100vh" flexDirection="column">
      <Header />

      <Workspace>
        <Switch>
          <Route
            path={AppRoutes.claimedOptOut.path}
            component={ClaimedOptOutRoute}
          />
          <Route path={AppRoutes.optOut.path} component={OptOutRoute} />
          <Route path={AppRoutes.claim.path} component={ClaimRoute} />
          <Route path={AppRoutes.wallet.path} component={Wallet} />
          <Route path={AppRoutes.manageWallet.path} component={ManageWallet} />
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
          <Route
            path={AppRoutes.sendSearch.path}
            exact
            component={SendSearch}
          />
          <Route path={AppRoutes.send.path} component={Send} />
          <Route path={AppRoutes.swap.path} component={SwapRoute} />
          <Route path={AppRoutes.prototype.path} component={PrototypeRoute} />
        </Switch>
        <Toaster
          position="bottom-center"
          containerStyle={{
            margin: "auto",
            width: "420px",
          }}
        />
      </Workspace>
    </Flex>

    {/* place app specific modals here */}
    <WalletSelectModal />
  </ContextProviders>
);
