import React from "react";
import { PublicKey } from "@solana/web3.js";
import { useParams } from "react-router-dom";
import { Profile, Spinner } from "wumbo-common";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import { useClaimedTokenRefKey } from "@strata-foundation/react";
import { useHistory } from "react-router-dom";
import {
  AppRoutes,
  profilePath,
  nftPath,
} from "../../../../../constants/routes";
import WalletRedirect from "../../Wallet/WalletRedirect";
import { useWallet } from "@solana/wallet-adapter-react";

export const ViewProfileRoute = () => {
  const params = useParams<{ tokenRefKey: string | undefined }>();
  const { connected, adapter } = useWallet();
  const publicKey = adapter?.publicKey;
  const walletTokenRefKey = useClaimedTokenRefKey(publicKey || undefined);
  const passedTokenRefKey = params.tokenRefKey
    ? new PublicKey(params.tokenRefKey)
    : undefined;
  const tokenRefKey = passedTokenRefKey || walletTokenRefKey;

  const history = useHistory();

  if (!tokenRefKey) {
    if (!connected) {
      return <WalletRedirect />;
    }

    return <Spinner />;
  }

  return (
    <Profile
      wumNetWorthPath={""}
      topTokensPath={""}
      // TODO: Web claim flow
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
