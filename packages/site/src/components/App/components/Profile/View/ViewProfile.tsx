import React from "react";
import { PublicKey } from "@solana/web3.js";
import { useParams, useHistory } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Box } from "@chakra-ui/react";
import { Profile, Spinner } from "wumbo-common";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import { useClaimedTokenRefKey, useTokenRef } from "@strata-foundation/react";
import {
  AppRoutes,
  profilePath,
  nftPath,
} from "../../../../../constants/routes";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const ViewProfileRoute: React.FC = () => {
  const params = useParams<{ tokenRefKey: string | undefined }>();
  const { connected, adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  const walletTokenRefKey = useClaimedTokenRefKey(publicKey, null);
  const passedTokenRefKey = params.tokenRefKey
    ? new PublicKey(params.tokenRefKey)
    : undefined;
  const tokenRefKey = passedTokenRefKey || walletTokenRefKey;
  const { info: tokenRef, loading } = useTokenRef(tokenRefKey);
  const history = useHistory();

  if (!tokenRefKey || !connected) {
    return <WalletRedirect />;
  }

  if (loading) {
    return <Spinner />;
  }

  if (!passedTokenRefKey && !tokenRef) {
    return (
      <Box p={4}>
        It looks like you haven't claimed a token yet. To claim your token,
        navigate to your twitter profile and click the "Claim" button that
        Wum.bo inserts next to Edit Profile.
      </Box>
    );
  }

  return (
    <Profile
      wumNetWorthPath={""}
      topTokensPath={""}
      useClaimFlow={() => ({
        claim: () => Promise.resolve(),
        loading: false,
        error: undefined,
      })}
      editPath={AppRoutes.editProfile.path}
      tokenRefKey={tokenRefKey}
      onAccountClick={(tokenBondingKey: PublicKey) => {
        history.push(profilePath(tokenBondingKey));
      }}
      getNftLink={(token: ITokenWithMetaAndAccount) => {
        const mint = token?.metadata?.mint;
        return mint ? nftPath(new PublicKey(mint)) : "";
      }}
    />
  );
};
