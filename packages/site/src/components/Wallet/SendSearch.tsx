import React, { useEffect } from "react";
import AppContainer from "../common/AppContainer";
import { ITokenWithMetaAndAccount, SendSearch } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";
import { Box } from "@chakra-ui/react";
import { sendPath } from "../../constants/routes";

export default React.memo(() => {
  return (
    <AppContainer>
      <WalletRedirect />
      <Box p={4}>
        <SendSearch
          getSendLink={(t: ITokenWithMetaAndAccount) =>
            sendPath(t.account!.mint)
          }
        />
      </Box>
    </AppContainer>
  );
});
