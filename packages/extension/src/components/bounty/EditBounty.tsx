import { usePublicKey } from "@strata-foundation/react";
import { bountyPath } from "constants/routes";
import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { EditBounty as CommonEditBounty } from "wumbo-common";
import WalletRedirect from "../wallet/WalletRedirect";
import { WumboDrawer } from "../WumboDrawer";

export const EditBounty: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const mintKey = usePublicKey(params.mint);
  const history = useHistory();

  return (
    <Fragment>
      <WalletRedirect />
      <WumboDrawer.Header title="Edit Bounty" />
      <WumboDrawer.Content>
        <CommonEditBounty
          mintKey={mintKey!}
          onComplete={() => history.push(bountyPath(mintKey!))}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
