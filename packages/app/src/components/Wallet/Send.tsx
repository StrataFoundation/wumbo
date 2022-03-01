import React from "react";
import { Send } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";
import { Box } from "@chakra-ui/react";
import { Routes } from "../../constants/routes";
import { AppContainer } from "../AppContainer";

export default React.memo(() => {
  return (
    <AppContainer>
      <WalletRedirect />
      <Box p={4} w="full">
        <Send finishRedirectUrl={Routes.wallet.path} />
      </Box>
    </AppContainer>
  );
});
