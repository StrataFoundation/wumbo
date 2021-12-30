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
  useClaimedTokenRefKey,
  usePublicKey,
  useTokenBondingFromMint,
  useTokenMetadata,
  useTokenRef,
} from "@strata-foundation/react";
import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Profile as CommonProfile } from "wumbo-common";
import WalletRedirect from "../wallet/WalletRedirect";
import { WumboDrawer } from "../WumboDrawer";

export const Profile = () => {
  const params = useParams<{ mint: string | undefined }>();
  const { connected, adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  const walletMintKey = useClaimedTokenRefKey(publicKey, null);
  const { info: walletTokenRef, loading } = useTokenRef(walletMintKey);
  const passedMintKey = usePublicKey(params.mint);
  const mintKey = passedMintKey || walletTokenRef?.mint;
  const history = useHistory();
  const { info: tokenBonding } = useTokenBondingFromMint(mintKey);
  const { metadata } = useTokenMetadata(mintKey);
  if (!connected) {
    return <WalletRedirect />;
  }

  if (loading) {
    return <WumboDrawer.Loading />;
  }

  if (!mintKey) {
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
          sendPath={sendSearchPath(walletTokenRef?.owner || undefined)}
          collectivePath={
            tokenBonding ? viewProfilePath(tokenBonding.baseMint) : null
          }
          editPath={routes.editProfile.path}
          useClaimFlow={useClaimFlow}
          mintKey={mintKey}
          onAccountClick={(mintKey) => history.push(viewProfilePath(mintKey))}
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
