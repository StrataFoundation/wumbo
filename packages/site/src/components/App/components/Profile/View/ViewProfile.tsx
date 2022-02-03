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
    <AppContainer>
      <Helmet>
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="314" />
        <meta
          property="og:image"
          content="https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={name ? name : "Test"} />
        <meta name="twitter:description" content="Brys Profile" />
      </Helmet>
      <Profile
        relinkPath={AppRoutes.relink.path}
        sendPath={sendSearchPath(tokenRef?.owner || twitterWallet || undefined)}
        collectivePath={
          tokenBonding ? profilePath(tokenBonding.baseMint) : null
        }
        editPath={AppRoutes.editProfile.path}
        useClaimFlow={(handle) => ({
          error: undefined,
          claimLoading: false,
          linkLoading: false,
          claim: async () => {
            history.push(AppRoutes.claim + `?handle=${handle}`);
          },
          link: async () => {
            throw new Error("Not yet supported on site");
          },
        })}
        mintKey={passedMintKey || tokenRef?.mint}
        onAccountClick={(mintKey, handle) => {
          if (handle) {
            history.push(AppRoutes.profile.path + `?name=${handle}`);
          } else if (mintKey) {
            history.push(profilePath(mintKey));
          }
        }}
        onTradeClick={() =>
          tokenBonding &&
          history.push(
            swapPath(
              tokenBonding.publicKey,
              tokenBonding!.baseMint,
              tokenBonding!.targetMint
            )
          )
        }
        getNftLink={(token) => {
          const mint = token?.metadata?.mint;
          return mint ? nftPath(new PublicKey(mint)) : "";
        }}
      />
    </AppContainer>
  );
};
