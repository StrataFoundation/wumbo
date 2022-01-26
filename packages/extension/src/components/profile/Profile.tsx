import {
  nftPath,
  routes,
  sendSearchPath,
  swapPath,
  viewProfilePath,
} from "@/constants/routes";
import { useClaimFlow } from "@/utils/claim";
import { Box } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  useMetaplexTokenMetadata,
  usePrimaryClaimedTokenRef,
  usePublicKey,
  useTokenBondingFromMint,
  useTokenRefForName,
} from "@strata-foundation/react";
import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  Profile as CommonProfile,
  useQuery,
  useReverseTwitter,
  useTwitterOwner,
  useTwitterTld,
} from "wumbo-common";
import WalletRedirect from "../wallet/WalletRedirect";
import { WumboDrawer } from "../WumboDrawer";

export const Profile = () => {
  const params = useParams<{ mint: string | undefined }>();
  const { connected, publicKey } = useWallet();
  const query = useQuery();
  const name = query.get("name");
  const tld = useTwitterTld();
  const passedMintKey = usePublicKey(params.mint);
  const history = useHistory();

  const { handle: twitterHandle } = useReverseTwitter(publicKey || undefined);

  const { info: tokenRef, loading } = useTokenRefForName(
    name || twitterHandle,
    null,
    tld
  );

  const { metadata } = useMetaplexTokenMetadata(tokenRef?.mint);
  const { info: tokenBonding } = useTokenBondingFromMint(
    passedMintKey || tokenRef?.mint
  );
  const { owner: twitterWallet } = useTwitterOwner(name || undefined);

  if (loading) {
    return <WumboDrawer.Loading />;
  }

  if (!passedMintKey && !name && !twitterHandle) {
    if (!connected) {
      return <WalletRedirect />
    }
    
    return (
      <Fragment>
        <WumboDrawer.Header title="Profile" />
        <WumboDrawer.Content>
          <Box p={4}>
            It looks like you haven't claimed a token yet. To claim your token,
            navigate to your twitter profile and click the "Claim" button that
            Wum.bo inserts next to Edit Profile.
          </Box>
        </WumboDrawer.Content>
        <WumboDrawer.Nav />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <WumboDrawer.Header
        title={metadata?.data.name || name || "View Profile"}
      />
      <WumboDrawer.Content>
        <CommonProfile
          relinkPath={routes.relink.path}
          sendPath={sendSearchPath(
            tokenRef?.owner || twitterWallet || undefined
          )}
          createPath={routes.create.path + `?name=${name}`}
          collectivePath={
            tokenBonding ? viewProfilePath(tokenBonding.baseMint) : null
          }
          editPath={routes.editProfile.path}
          useClaimFlow={useClaimFlow}
          mintKey={passedMintKey || tokenRef?.mint}
          onAccountClick={(mintKey, handle) => {
            if (handle) {
              history.push(routes.profile.path + `?name=${handle}`);
            } else if (mintKey) {
              history.push(viewProfilePath(mintKey));
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
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
