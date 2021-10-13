import React, { useEffect, useMemo, useState } from "react";
import AppContainer from "../../common/AppContainer";
import { PublicKey } from "@solana/web3.js";
import { useHistory, useParams } from "react-router-dom";
import { EditProfile, useClaimedTokenRef } from "wumbo-common";
import { profilePath } from "../../../constants/routes";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const EditProfileRoute = React.memo(() => {
  const params = useParams<{ ownerWalletKey: string }>();
  const ownerWalletKey = useMemo(
    () => new PublicKey(params.ownerWalletKey),
    [params.ownerWalletKey]
  );
  const { info: tokenRef } = useClaimedTokenRef(ownerWalletKey);
  const tokenBondingKey = tokenRef?.tokenBonding;
  const history = useHistory();
  return (
    <AppContainer>
      <WalletRedirect />
      <EditProfile
        ownerWalletKey={ownerWalletKey}
        onComplete={() =>
          tokenBondingKey && history.push(profilePath(tokenBondingKey))
        }
      />
    </AppContainer>
  );
});
