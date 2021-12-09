import React, { useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useHistory, useParams } from "react-router-dom";
import { EditProfile } from "wumbo-common";
import { usePrimaryClaimedTokenRef } from "@strata-foundation/react";
import { profilePath } from "../../../../../constants/routes";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const EditProfileRoute = React.memo(() => {
  const params = useParams<{ ownerWalletKey: string }>();
  const ownerWalletKey = useMemo(
    () => new PublicKey(params.ownerWalletKey),
    [params.ownerWalletKey]
  );
  const { info: tokenRef } = usePrimaryClaimedTokenRef(ownerWalletKey);
  const tokenBondingKey = tokenRef?.tokenBonding;
  const history = useHistory();
  return (
    <>
      <WalletRedirect />
      <EditProfile
        ownerWalletKey={ownerWalletKey}
        onComplete={() =>
          tokenBondingKey && history.push(profilePath(tokenBondingKey))
        }
      />
    </>
  );
});
