import { routes } from "@/constants/routes";
import { Box, Flex, Link, Stack, Text } from "@chakra-ui/react";
import React, { FC } from "react";
import { MemoryRouter as Router, Route, Switch } from "react-router-dom";
import { CreateBounty, EditBounty, ViewBounty } from "./bounty";
import Claim from "./claim/Claim";
import { ContextProviders } from "./ContextProviders";
import { Create } from "./create/Create";
import { MintConfirmationRoute } from "./create/MintConfirmation";
import { NftEnhancer } from "./nft/NftEnhancer";
import { TagNft } from "./nft/TagNft";
import { ViewNft } from "./nft/ViewNft";
import { EditProfileRoute } from "./profile/EditProfile";
import { Profile } from "./profile/Profile";
import { RelinkRoute } from "./profile/Relink";
import { SwapRoute } from "./swap/Swap";
import { SwapConfirmationRoute } from "./swap/SwapConfirmation";
import { Twitter } from "./twitter/Twitter";
import { ManageWallet } from "./wallet/ManageWallet";
import { Send } from "./wallet/Send";
import { SendSearch } from "./wallet/SendSearch";
import { Wallet } from "./wallet/Wallet";
import { WumboDrawer } from "./WumboDrawer";

const App: FC = () => (
  <Router initialEntries={[routes.myTokens.path]} initialIndex={0}>
    <ContextProviders>
      {/* <NftEnhancer />
      <Twitter /> */}

      <WumboDrawer>
        <Flex
          padding={4}
          borderBottom="1px"
          borderColor="gray.200"
          fontFamily="body"
          minH="61px"
        >
          <Flex w="full" alignItems="center" justifyContent="space-between">
            <Text fontSize="lg" fontWeight="medium" color="indigo.500">
              Sunsetting Wumbo
            </Text>
          </Flex>
        </Flex>
        <Stack
          padding={4}
          pos="relative"
          flexGrow={1}
          gap={4}
          overflowY="auto"
          fontFamily="body"
        >
          <Text>
            Today we're sad to announce that, after multiple conversations and
            contemplating amongst the team, we have decided its time to sunset
            wumbo.
          </Text>
          <Text>
            Thanks for giving Wumbo a try. Our team greatly appreciated you and
            your early support!
          </Text>
          <Text>
            You Can read the blog post and recoup your SOL from the link below.
          </Text>
          <Link
            href="https://blog.strataprotocol.com/sunsetting-wumbo"
            target="_blank"
            color="purple.600"
          >
            Sunsetting Wumbo
          </Link>
        </Stack>
        {/* <Switch>
          <Route path={routes.relink.path} component={RelinkRoute} />
          <Route path={routes.create.path} component={Create} />
          <Route
            path={routes.mintConfirmation.path}
            component={MintConfirmationRoute}
          />
          <Route path={routes.claim.path} component={Claim} />
          <Route path={routes.swap.path} component={SwapRoute} />
          <Route
            path={routes.swapConfirmation.path}
            component={SwapConfirmationRoute}
          />
          <Route path={routes.myTokens.path} component={Wallet} />
          <Route path={routes.manageWallet.path} component={ManageWallet} />
          <Route path={routes.viewProfile.path} component={Profile} />
          <Route path={routes.viewNft.path} component={ViewNft} />
          <Route path={routes.tagNft.path} component={TagNft} />
          <Route path={routes.editProfile.path} component={EditProfileRoute} />
          <Route path={routes.viewBounty.path} component={ViewBounty} />
          <Route path={routes.editBounty.path} component={EditBounty} />
          <Route path={routes.createBounty.path} component={CreateBounty} />
          <Route path={routes.profile.path} exact component={Profile} />
          <Route path={routes.sendSearch.path} exact component={SendSearch} />
          <Route path={routes.send.path} component={Send} />
        </Switch> */}
      </WumboDrawer>
    </ContextProviders>
  </Router>
);

export default App;
