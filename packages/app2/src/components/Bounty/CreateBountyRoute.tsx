import { usePublicKey } from "@strata-foundation/react";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { CreateBounty } from "wumbo-common";
import { AppContainer } from "../AppContainer";
import WalletRedirect from "../Wallet/WalletRedirect";
import { bountyPath } from "../../constants/routes";

export const CreateBountyRoute: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const mintKey = usePublicKey(params.mint);
  const history = useHistory();

  return (
    <AppContainer>
      <WalletRedirect />
      <CreateBounty
        mintKey={mintKey!}
        onComplete={(mint) => history.push(bountyPath(mint))}
      />
    </AppContainer>
  );
};
