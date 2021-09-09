import React from "react";
import { PublicKey } from "@solana/web3.js";
import { useParams } from "react-router";
import AppContainer from "../../common/AppContainer";
import { Profile, Spinner, useClaimedTokenRef, useWallet } from "wumbo-common";
import { useHistory } from "react-router-dom";
import { profilePath, nftPath } from "../../../constants/routes";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const ViewProfileRoute = () => {
  const params = useParams<{ tokenBondingKey: string | undefined }>();
  const { publicKey } = useWallet();
  const { info: tokenRef, loading } = useClaimedTokenRef(
    publicKey || undefined
  );
  const history = useHistory();

  let tokenBondingKey: PublicKey;
  if (params.tokenBondingKey) {
    tokenBondingKey = new PublicKey(params.tokenBondingKey);
  } else {
    if (!publicKey) {
      return <WalletRedirect />;
    }

    if (loading) {
      return (
        <AppContainer>
          <Spinner />
        </AppContainer>
      );
    }

    tokenBondingKey = tokenRef!.tokenBonding;
  }

  return (
    <AppContainer>
      <Profile
        tokenBondingKey={tokenBondingKey}
        onAccountClick={(tokenBondingKey: PublicKey) => {
          history.push(profilePath(tokenBondingKey));
        }}
        getNftLink={(token) => token?.account ? nftPath(token?.account?.mint) : ""}
      />
    </AppContainer>
  );
};
