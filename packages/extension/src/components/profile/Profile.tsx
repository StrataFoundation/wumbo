import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import {
  useAccount,
  TokenRef,
  useWallet,
  Profile as CommonProfile,
  useClaimedTokenRefKey,
  useTokenMetadata,
  handleErrors,
} from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";
import {
  nftPath,
  routes,
  topTokensPath,
  tradePath,
  viewProfilePath,
  wumNetWorthPath,
} from "@/constants/routes";
import WalletRedirect from "../wallet/WalletRedirect";
import { useClaimFlow } from "@/utils/claim";
import { Box } from "@chakra-ui/react";

export const Profile = () => {
  const params = useParams<{ tokenRefKey: string | undefined }>();
  const { connected, publicKey } = useWallet();
  const walletTokenRefKey = useClaimedTokenRefKey(publicKey || undefined);
  const passedTokenRefKey = params.tokenRefKey
    ? new PublicKey(params.tokenRefKey)
    : undefined;
  const tokenRefKey = passedTokenRefKey || walletTokenRefKey;
  const { info: tokenRef, loading } = useAccount(tokenRefKey, TokenRef, true);
  const ownerWalletKey = tokenRef?.owner as PublicKey | undefined;
  const {
    metadata,
    loading: loadingMetadata,
    error: tokenMetadataError,
  } = useTokenMetadata(tokenRef?.mint);
  handleErrors(tokenMetadataError);

  const history = useHistory();

  if (!tokenRefKey || !connected) {
    return <WalletRedirect />;
  }

  if (loading || loadingMetadata) {
    return <WumboDrawer.Loading />;
  }

  if (!passedTokenRefKey && !tokenRef) {
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
      <WumboDrawer.Header title={metadata?.data.name || "View Profile"} />
      <WumboDrawer.Content>
        <CommonProfile
          topTokensPath={tokenRef ? topTokensPath(tokenRef.tokenBonding) : ""}
          wumNetWorthPath={
            tokenRef?.owner ? wumNetWorthPath(tokenRef.owner as PublicKey) : ""
          }
          editPath={routes.editProfile.path}
          useClaimFlow={useClaimFlow}
          tokenRefKey={tokenRefKey}
          onAccountClick={(tokenRefKey) =>
            history.push(viewProfilePath(tokenRefKey))
          }
          onTradeClick={() =>
            tokenRef && history.push(tradePath(tokenRef.tokenBonding, "buy"))
          }
          getNftLink={(token) =>
            token?.metadata ? nftPath(token?.metadata?.mint) : ""
          }
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
