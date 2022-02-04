import { Box } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  usePublicKey,
  useTokenBondingFromMint,
  useTokenRefForName,
} from "@strata-foundation/react";
import React from "react";
import { Helmet } from "react-helmet";
import { useHistory, useParams } from "react-router-dom";
import {
  Profile,
  Spinner,
  useQuery,
  useTwitterOwner,
  useTwitterTld,
} from "wumbo-common";
import {
  AppRoutes,
  nftPath,
  profilePath,
  sendSearchPath,
  swapPath,
} from "../../../../../constants/routes";
import { AppContainer } from "../../common/AppContainer";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const ViewProfileRoute: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const query = useQuery();
  const name = query.get("name");
  const { connected } = useWallet();
  const tld = useTwitterTld();
  const { info: tokenRef, loading } = useTokenRefForName(name, null, tld);
  const passedMintKey = usePublicKey(params.mint);
  const history = useHistory();
  const { info: tokenBonding } = useTokenBondingFromMint(
    passedMintKey || tokenRef?.mint
  );
  const { owner: twitterWallet } = useTwitterOwner(name || undefined);

  if (loading) {
    return <Spinner />;
  }

  if (!passedMintKey && !name) {
    if (!connected) {
      return <WalletRedirect />;
    }
    return (
      <AppContainer>
        <Box p={4}>
          It looks like you haven't claimed a token yet. To claim your token,
          navigate to your twitter profile and click the "Claim" button that
          Wum.bo inserts next to Edit Profile.
        </Box>
      </AppContainer>
    );
  }

  return (
    <Helmet>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@nytimesbits" />
      <meta name="twitter:creator" content="@nickbilton" />
      <meta
        property="og:url"
        content="http://bits.blogs.nytimes.com/2011/12/08/a-twitter-for-my-sister/"
      />
      <meta property="og:title" content="A Twitter for My Sister" />
      <meta
        property="og:description"
        content="In the early days, Twitter grew so quickly that it was almost impossible to add new features because engineers spent their time trying to keep the rocket ship from stalling."
      />
      <meta
        property="og:image"
        content="http://graphics8.nytimes.com/images/2011/12/08/technology/bits-newtwitter/bits-newtwitter-tmagArticle.jpg"
      />
    </Helmet>
  );
};
