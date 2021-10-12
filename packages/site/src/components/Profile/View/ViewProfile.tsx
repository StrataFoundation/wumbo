import React from "react";
import { PublicKey } from "@solana/web3.js";
import { useParams } from "react-router";
import AppContainer from "../../common/AppContainer";
import { Profile, Spinner, useClaimedTokenRefKey, useAccount, TokenRef, useWallet } from "wumbo-common";
import { useHistory } from "react-router-dom";
import routes, { profilePath, nftPath } from "../../../constants/routes";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const ViewProfileRoute = () => {
  const params = useParams<{ tokenRefKey: string | undefined }>();
  const { connected, publicKey } = useWallet();
  const walletTokenRefKey = useClaimedTokenRefKey(publicKey || undefined);
  const { info: walletTokenRef } = useAccount(walletTokenRefKey, TokenRef, true);
  const { info: passedTokenRef } = useAccount(walletTokenRefKey, TokenRef, true);
  const passedTokenRefKey = params.tokenRefKey ? new PublicKey(params.tokenRefKey) : undefined;
  const tokenRefKey = passedTokenRefKey || walletTokenRefKey;
  const tokenRef = passedTokenRef || walletTokenRef;

  const history = useHistory();

  if (!tokenRefKey) {
    if (!connected) {
      return <WalletRedirect />;
    }

    return (
      <AppContainer>
        <Spinner />
      </AppContainer>
    );
  }


  return (
    <AppContainer>
      <Profile
        wumNetWorthPath={""}
        topTokensPath={""}
        // TODO: Web claim flow
        useClaimFlow={() => ({
          claim: () => Promise.resolve(),
          loading: false,
          error: undefined
        })}
        editPath={routes.editProfile.path}
        tokenRefKey={tokenRefKey}
        onAccountClick={(tokenBondingKey: PublicKey) => {
          history.push(profilePath(tokenBondingKey));
        }}
        getNftLink={(token) => token?.metadata ? nftPath(token?.metadata?.mint) : ""}
      />
    </AppContainer>
  );
};
