import React, { Dispatch, SetStateAction } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  PortalProps,
} from "@chakra-ui/react";
import { ITokenWithMeta } from "../utils";
import { Nft } from "./Nft";

export const ExpandedNft = ({
  isExpanded,
  setIsExpanded,
  tokenData,
  portalProps = {},
}: {
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
  tokenData: ITokenWithMeta;
  portalProps?: Pick<PortalProps, "appendToParentPortal" | "containerRef">;
}) => (
  <Modal
    onClose={() => setIsExpanded(!isExpanded)}
    size="full"
    isOpen={isExpanded}
    portalProps={portalProps}
  >
    <ModalOverlay />
    <ModalContent bgColor="transparent">
      <ModalCloseButton color="gray.100" _hover={{ color: "gray.200" }} />
      <ModalBody display="flex" justifyContent="center" alignItems="center">
        {tokenData.data && <Nft data={tokenData.data} />}
      </ModalBody>
    </ModalContent>
  </Modal>
);
