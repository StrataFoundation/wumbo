import React from "react";
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import { WalletSelect } from "wumbo-common";
import { useModal } from "../../../../contexts";

export const WalletSelectModal: React.FC = () => {
  const { modalType, hideModal } = useModal();

  return (
    <Modal isOpen={modalType === "WalletSelect"} onClose={() => hideModal()}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <WalletSelect />
      </ModalContent>
    </Modal>
  );
};
