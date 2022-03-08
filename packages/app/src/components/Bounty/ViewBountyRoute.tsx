import { usePublicKey } from "@strata-foundation/react";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { ViewBounty } from "wumbo-common";
import { editBountyPath, profilePath } from "../../constants/routes";
import { AppContainer } from "../AppContainer";
import WalletRedirect from "../Wallet/WalletRedirect";

export const ViewBountyRoute: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const mintKey = usePublicKey(params.mint);
  const history = useHistory();

  return (
    <AppContainer>
      <WalletRedirect />
      <ViewBounty
        mintKey={mintKey}
        onEdit={() => history.push(editBountyPath(mintKey!))}
        getCreatorLink={(c, t, tokenRef) => {
          return tokenRef
            ? profilePath(tokenRef.mint)
            : `https://explorer.solana.com/address/${c.toBase58()}`;
        }}
      />
    </AppContainer>
  );
};
