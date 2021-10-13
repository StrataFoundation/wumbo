import React from "react";
import { Send } from "wumbo-common";
import WalletRedirect from "./WalletRedirect";
import { Box } from "@chakra-ui/react";
import { AppRoutes } from "../../../../constants/routes";

export default React.memo(() => {
  return (
    <>
      <WalletRedirect />
      <Box p={4}>
        <Send finishRedirectUrl={AppRoutes.wallet.path} />
      </Box>
    </>
  );
});
