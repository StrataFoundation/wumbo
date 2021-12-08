import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import {
  Profile as CommonProfile,
  
} from "wumbo-common";
import {
  useTokenRef,
  useClaimedTokenRefKey,
  useTokenMetadata,
  useErrorHandler,
} from "@strata-foundation/react";
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
import { useWallet } from "@solana/wallet-adapter-react";
import { useClaimFlow } from "@/utils/claim";
import { Box } from "@chakra-ui/react";

export const Profile = () => {
  const params = useParams<{ tokenRefKey: string | undefined }>();
  const { connected, adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  const walletTokenRefKey = useClaimedTokenRefKey(publicKey || undefined);
  const passedTokenRefKey = params.tokenRefKey
    ? new PublicKey(params.tokenRefKey)
    : undefined;
  const tokenRefKey = passedTokenRefKey || walletTokenRefKey;
  const { info: tokenRef, loading } = useTokenRef(tokenRefKey);
  const {
    metadata,
    loading: loadingMetadata,
    error: tokenMetadataError,
  } = useTokenMetadata(tokenRef?.mint);
  const { handleErrors } = useErrorHandler();
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
          topTokensPath={tokenRef?.tokenBonding ? topTokensPath(tokenRef.tokenBonding) : ""}
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
            tokenRef?.tokenBonding && history.push(tradePath(tokenRef.tokenBonding, "buy"))
          }
          getNftLink={(token) =>
            tokenRef?.mint ? nftPath(tokenRef?.mint) : ""
          }
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
