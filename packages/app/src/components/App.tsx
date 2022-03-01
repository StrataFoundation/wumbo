import React from "react";
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
} from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import { Header } from "./Header";
import { Workspace } from "./Workspace";
import { Toaster } from "react-hot-toast";
import { profilePath, Routes } from "../constants/routes";
import { ClaimRoute } from "./Claim/Claim";
import { OptOutRoute } from "./Claim/OptOut";
import { ClaimedOptOutRoute } from "./Claim/ClaimedOptOut";
import { EditProfileRoute } from "./Profile/Edit/EditProfile";
import ManageWallet from "./Wallet/ManageWallet";
import Wallet from "./Wallet/Wallet";
import Send from "./Wallet/Send";
import SendSearch from "./Wallet/SendSearch";
import { ViewProfileRoute } from "./Profile/View/ViewProfile";
import { ViewNftRoute } from "./Nft/View/ViewNft";
import { SwapRoute } from "./Swap/Swap";
import { BurnBetaRoute } from "./BurnBeta/BurnBetaRoute";
import { PrototypeRoute } from "./Prototype";
import { ContextProviders } from "./ContextProviders";
import { RelinkRoute } from "./Relink/Relink";
import { WalletSelectModal } from "./modals/WalletSelectModal";
import { SwapConfirmationRoute } from "./Swap/SwapConfirmation";
import { PublicKey } from "@solana/web3.js";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";

const LegacyAppRouteRedirect: React.FC = () => {
  const { pathname, search } = useLocation();
  const sanitizedPathname = pathname.replace("/app", "") + search;

  return <Redirect to={sanitizedPathname} />;
};

export const App: React.FC = () => (
  <ContextProviders>
    <Flex w="full" h="100vh" flexDirection="column">
      <Header />

      <Workspace>
        <Switch>
          <Route path={Routes.relink.path} component={RelinkRoute} />
          <Route
            path={Routes.claimedOptOut.path}
            component={ClaimedOptOutRoute}
          />
          <Route path={Routes.optOut.path} component={OptOutRoute} />
          <Route path={Routes.claim.path} component={ClaimRoute} />
          <Route path={Routes.wallet.path} component={Wallet} />
          <Route path={Routes.manageWallet.path} component={ManageWallet} />
          <Route path={Routes.viewProfile.path} component={ViewProfileRoute} />
          <Route path={Routes.viewNft.path} component={ViewNftRoute} />
          <Route
            path={Routes.profile.path}
            exact
            component={ViewProfileRoute}
          />
          <Route path={Routes.editProfile.path} component={EditProfileRoute} />
          <Route path={Routes.sendSearch.path} exact component={SendSearch} />
          <Route path={Routes.send.path} component={Send} />
          <Route path={Routes.swap.path} component={SwapRoute} />
          <Route
            path={Routes.swapConfirmation.path}
            component={SwapConfirmationRoute}
          />
          <Route path={Routes.burnBeta.path} component={BurnBetaRoute} />
          <Route path={Routes.prototype.path} component={PrototypeRoute} />
          {/* catch all route redirction for legacy /app urls */}
          <Route path="/app" component={LegacyAppRouteRedirect} />
          <Redirect
            from={Routes.root.path}
            to={profilePath(
              new PublicKey(SplTokenCollective.OPEN_COLLECTIVE_MINT_ID)
            )}
          />
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
