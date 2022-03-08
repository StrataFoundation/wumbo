import { VStack } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { BountyDetail } from "@strata-foundation/marketplace-ui";
import {
  IUseTokenMetadataResult,
  useErrorHandler,
  useTokenMetadata,
} from "@strata-foundation/react";
import { ExpandedNft } from "../Nft/ExpandedNft";
import React, { useState } from "react";
import { HiOutlineArrowsExpand } from "react-icons/hi";
import { GetCreatorLink } from "../Nft";
import { NftSmallView } from "../Nft/NftSmallView";

export const ViewBountyRaw = React.memo(
  ({
    mintKey,
    token,
    getCreatorLink,
    modalRef,
    onEdit,
  }: {
    mintKey?: PublicKey;
    token: IUseTokenMetadataResult;
    getCreatorLink: GetCreatorLink;
    modalRef?: React.MutableRefObject<HTMLInputElement>;
    onEdit: () => void;
  }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    return (
      <>
        <VStack w="full">
          <NftSmallView
            actionIcon={HiOutlineArrowsExpand}
            onActionClick={() => setIsExpanded(true)}
            token={token}
          />
          <BountyDetail mintKey={mintKey} onEdit={onEdit} />
        </VStack>
        <ExpandedNft
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          tokenData={token}
          portalProps={{
            containerRef: modalRef,
          }}
        />
      </>
    );
  }
);

export const ViewBounty = React.memo(
  ({
    mintKey,
    getCreatorLink,
    modalRef,
    onEdit,
  }: {
    mintKey?: PublicKey;
    getCreatorLink: GetCreatorLink;
    modalRef?: React.MutableRefObject<HTMLInputElement>;
    onEdit: () => void;
  }) => {
    const { handleErrors } = useErrorHandler();
    const tokenWithMeta = useTokenMetadata(mintKey);

    handleErrors(tokenWithMeta.error);

    return (
      <ViewBountyRaw
        mintKey={mintKey}
        token={tokenWithMeta}
        getCreatorLink={getCreatorLink}
        modalRef={modalRef}
        onEdit={onEdit}
      />
    );
  }
);
