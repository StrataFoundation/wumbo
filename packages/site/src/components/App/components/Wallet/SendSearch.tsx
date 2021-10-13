import React from "react";
import { ITokenWithMetaAndAccount, SendSearch } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";
import { Box } from "@chakra-ui/react";
import { sendPath } from "../../../../constants/routes";

export default React.memo(() => {
  return (
    <>
      <WalletRedirect />
      <Box p={4}>
        <SendSearch
          getSendLink={(t: ITokenWithMetaAndAccount) =>
            sendPath(t.account!.mint)
          }
        />
      </Box>
    </>
  );
});
