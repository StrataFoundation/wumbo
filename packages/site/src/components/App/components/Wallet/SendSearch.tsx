import { Box } from "@chakra-ui/react";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import React from "react";
import { SendSearch } from "wumbo-common";
import { sendPath } from "../../../../constants/routes";
import WalletRedirect from "./WalletRedirect";

export default React.memo(() => {
  return (
    <>
      <WalletRedirect />
      <Box p={4} w="full">
        <SendSearch
          getSendLink={(t: ITokenWithMetaAndAccount) =>
            sendPath(t.account!.mint)
          }
        />
      </Box>
    </>
  );
});
