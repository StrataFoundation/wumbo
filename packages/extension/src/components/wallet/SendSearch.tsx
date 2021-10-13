import { Box } from "@chakra-ui/react";
import React, { Fragment, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ITokenWithMetaAndAccount,
  SendSearch as CommonSendSearch,
} from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";
import { sendPath } from "@/constants/routes";

export const SendSearch = () => {
  return (
    <Fragment>
      <WumboDrawer.Header title="Send" />
      <WumboDrawer.Content>
        <Box padding={4}>
          <CommonSendSearch
            getSendLink={(t: ITokenWithMetaAndAccount) =>
              sendPath(t.account!.mint)
            }
          />
        </Box>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
