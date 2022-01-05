import { Box } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import React from "react";
import { SendSearch, useQuery } from "wumbo-common";
import { sendPath } from "../../../../constants/routes";
import { AppContainer } from "../common/AppContainer";
import WalletRedirect from "./WalletRedirect";

export default React.memo(() => {
  const query = useQuery();
  const recipient = query.get("recipient");

  return (
    <AppContainer>
      <WalletRedirect />
      <Box p={4} w="full">
        <SendSearch
          getSendLink={(t: ITokenWithMetaAndAccount) =>
            sendPath(
              t.account!.mint,
              recipient ? new PublicKey(recipient) : undefined
            )
          }
        />
      </Box>
    </AppContainer>
  );
});
