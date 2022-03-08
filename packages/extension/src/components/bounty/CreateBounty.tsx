import { usePublicKey } from "@strata-foundation/react";
import { bountyPath } from "constants/routes";
import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { CreateBounty as CommonCreateBounty } from "wumbo-common";
import WalletRedirect from "../wallet/WalletRedirect";
import { WumboDrawer } from "../WumboDrawer";

export const CreateBounty: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const mintKey = usePublicKey(params.mint);
  const history = useHistory();

  return (
    <Fragment>
      <WalletRedirect />
      <WumboDrawer.Header title="Create Bounty" />
      <WumboDrawer.Content>
        <CommonCreateBounty
          mintKey={mintKey!}
          onComplete={(mint) => history.push(bountyPath(mint))}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
