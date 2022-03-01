import { Box } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import React from "react";
import { useQuery } from "wumbo-common";
import { sendPath } from "../../constants/routes";
import { AppContainer } from "../AppContainer";
import WalletRedirect from "./WalletRedirect";
import { TokenSearch } from "@strata-foundation/react";
import { useHistory } from "react-router-dom";

export default React.memo(() => {
  const query = useQuery();
  const recipient = query.get("recipient");
  const history = useHistory();

  return (
    <AppContainer>
      <WalletRedirect />
      <Box p={4} w="full">
        <TokenSearch
          onSelect={(t: ITokenWithMetaAndAccount) => {
            history.push(
              sendPath(
                t.account!.mint,
                recipient ? new PublicKey(recipient) : undefined
              )
            );
          }}
        />
      </Box>
    </AppContainer>
  );
});
