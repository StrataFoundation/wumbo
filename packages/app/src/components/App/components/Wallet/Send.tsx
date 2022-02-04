import React from "react";
import { Send } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";
import { Box } from "@chakra-ui/react";
import { AppRoutes } from "../../../../constants/routes";
import { AppContainer } from "../common/AppContainer";

export default React.memo(() => {
  return (
    <AppContainer>
      <WalletRedirect />
      <Box p={4} w="full">
        <Send finishRedirectUrl={AppRoutes.wallet.path} />
      </Box>
    </AppContainer>
  );
});
