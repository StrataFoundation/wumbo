import React, { useEffect } from "react";
import AppContainer from "../common/AppContainer";
import { Send } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";
import { Box } from "@chakra-ui/react";
import routes from "../../constants/routes";

export default React.memo(() => {
  return (
    <AppContainer>
      <WalletRedirect />
      <Box p={4}>
        <Send finishRedirectUrl={routes.wallet.path} />
      </Box>
    </AppContainer>
  );
});
