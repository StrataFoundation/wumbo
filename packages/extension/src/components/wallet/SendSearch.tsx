import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import { sendPath } from "@/constants/routes";
import { Box } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import React, { Fragment } from "react";
import { SendSearch as CommonSendSearch, useQuery } from "wumbo-common";
import { WumboDrawer } from "../WumboDrawer";

export const SendSearch = () => {
  const query = useQuery();
  const recipient = query.get("recipient");

  return (
    <Fragment>
      <WumboDrawer.Header title="Send" />
      <WumboDrawer.Content>
        <Box padding={4}>
          <CommonSendSearch
            getSendLink={(t: ITokenWithMetaAndAccount) =>
              sendPath(
                t.account!.mint,
                recipient ? new PublicKey(recipient) : undefined
              )
            }
          />
        </Box>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
