import { routes } from "@/constants/routes";
import { Box } from "@chakra-ui/react";
import React, { Fragment, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Send as CommonSend } from "wumbo-common";
import { usePublicKey, useTokenMetadata } from "@strata-foundation/react";
import { WumboDrawer } from "../WumboDrawer";

export const Send = () => {
  const params = useParams<{ mint: string | undefined }>();
  const mint = usePublicKey(params.mint);
  const { metadata: baseMetadata } = useTokenMetadata(mint);

  return (
    <Fragment>
      <WumboDrawer.Header title={`Send ${baseMetadata?.data.symbol}`} />
      <WumboDrawer.Content>
        <Box padding={4}>
          <CommonSend finishRedirectUrl={routes.myTokens.path} />
        </Box>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
