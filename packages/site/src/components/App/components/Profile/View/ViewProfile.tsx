import { Box } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  useClaimedTokenRefKey,
  usePublicKey,
  useTokenBondingFromMint,
  useTokenRef,
} from "@strata-foundation/react";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Profile, Spinner } from "wumbo-common";
import {
  AppRoutes,
  nftPath,
  profilePath,
  swapPath,
  sendSearchPath,
} from "../../../../../constants/routes";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const ViewProfileRoute: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const { connected, adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  const walletMintKey = useClaimedTokenRefKey(publicKey, null);
  const { info: walletTokenRef, loading } = useTokenRef(walletMintKey);
  const passedMintKey = usePublicKey(params.mint);
  const mintKey = passedMintKey || walletTokenRef?.mint;
  const history = useHistory();
  const { info: tokenBonding } = useTokenBondingFromMint(mintKey);

  if (!connected) {
    return <WalletRedirect />;
  }

  if (loading) {
    return <Spinner />;
  }

  if (!mintKey) {
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
      sendPath={sendSearchPath(walletTokenRef?.owner || undefined)}
      collectivePath={tokenBonding ? profilePath(tokenBonding.baseMint) : null}
      useClaimFlow={() => ({
        claim: () => Promise.resolve(),
        loading: false,
        error: undefined,
      })}
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
      editPath={AppRoutes.editProfile.path}
      mintKey={mintKey}
      onAccountClick={(mintKey: PublicKey) => {
        history.push(profilePath(mintKey));
      }}
      getNftLink={(token: ITokenWithMetaAndAccount) => {
        const mint = token?.metadata?.mint;
        return mint ? nftPath(new PublicKey(mint)) : "";
      }}
    />
  );
};
