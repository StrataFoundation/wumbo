import { Box } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { EditBountyForm } from "@strata-foundation/marketplace-ui";
import React from "react";

export const EditBounty = ({
  mintKey,
  onComplete,
}: {
  mintKey: PublicKey;
  onComplete?: () => void;
}) => {
  return (
    <Box p={4}>
      <EditBountyForm
        hide={new Set(["mint", "contact", "discussion"])}
        mintKey={mintKey}
        onComplete={onComplete}
      />
    </Box>
  );
};
