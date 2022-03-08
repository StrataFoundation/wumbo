import {
  EditBountyForm,
  FormContainer,
} from "@strata-foundation/marketplace-ui";
import { routes, route } from "../../../utils/routes";
import { usePublicKey } from "@strata-foundation/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Header } from "@/components";

export const EditBounty: NextPage = () => {
  const router = useRouter();
  const { mintKey: mintKeyRaw } = router.query;
  const mintKey = usePublicKey(mintKeyRaw as string);

  return (
    <>
      <Header showWallet />
      <FormContainer title="Edit Bounty">
        {mintKey && (
          <EditBountyForm
            mintKey={mintKey}
            onComplete={() => {
              router.push(
                route(routes.bounty, { mintKey: mintKey.toBase58() })
              );
            }}
          />
        )}
      </FormContainer>
    </>
  );
};

export default EditBounty;
