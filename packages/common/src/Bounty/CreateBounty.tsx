import { Box } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { BountyForm } from "@strata-foundation/marketplace-ui";
import React from "react";

export const CreateBounty = ({
  mintKey,
  onComplete,
}: {
  mintKey: PublicKey;
  onComplete?: (mintKey: PublicKey) => void;
}) => {
  return (
    <Box p={4}>
      <BountyForm
        hide={new Set(["mint", "contact", "discussion"])}
        onComplete={onComplete}
        defaultValues={{
          mint: mintKey.toBase58(),
        }}
      />
    </Box>
  );
};
