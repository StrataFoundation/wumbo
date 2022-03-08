import { Box } from "@chakra-ui/react";
import { usePublicKey } from "@strata-foundation/react";
import { editBountyPath, viewProfilePath } from "constants/routes";
import React, { Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ViewBounty as CommonViewBounty } from "wumbo-common";
import WalletRedirect from "../wallet/WalletRedirect";
import { useOutsideOfDrawerRef, WumboDrawer } from "../WumboDrawer";

export const ViewBounty: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const mintKey = usePublicKey(params.mint);
  const history = useHistory();
  const modalRef = useOutsideOfDrawerRef();

  return (
    <Fragment>
      <WalletRedirect />
      <WumboDrawer.Header title="Bounty" />
      <WumboDrawer.Content>
        <Box w="full" h="full" fontSize="13px">
          <CommonViewBounty
            modalRef={modalRef}
            mintKey={mintKey}
            onEdit={() => history.push(editBountyPath(mintKey!))}
            getCreatorLink={(c, t, tokenRef) => {
              return tokenRef
                ? viewProfilePath(tokenRef.mint)
                : `https://explorer.solana.com/address/${c.toBase58()}`;
            }}
          />
        </Box>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
