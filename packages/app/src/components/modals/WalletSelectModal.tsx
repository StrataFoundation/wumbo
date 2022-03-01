import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import { usePrevious, WalletSelect } from "wumbo-common";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import { useModal } from "../../contexts";
import { useErrorHandler } from "@strata-foundation/react";

export const WalletSelectModal: React.FC = React.memo(() => {
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);
  const { modalType, hideModal } = useModal();
  const { connecting, connect, connected, select } = useWallet();
  const previousConnecting = usePrevious(connecting);
  const { handleErrors } = useErrorHandler();

  useEffect(() => {
    if (connecting) {
      setSelectedWallet(null);
    }

    if (previousConnecting && !connecting && connected) {
      hideModal();
    }
  }, [connecting, previousConnecting, connected, hideModal]);

  const handleOnSelect = (name: WalletName) => {
    select(name);
    setSelectedWallet(name);
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (e) {
      handleErrors(e as Error);
      setSelectedWallet(null);
    }
  };

  return (
    <Modal isOpen={modalType === "WalletSelect"} onClose={() => hideModal()}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <WalletSelect
          onSelect={handleOnSelect}
          selectedWallet={selectedWallet}
        />
        <Box w="full" p={4}>
          <Button
            w="full"
            colorScheme="indigo"
            variant="outline"
            onClick={handleConnect}
            disabled={!selectedWallet}
          >
            Connect
          </Button>
        </Box>
      </ModalContent>
    </Modal>
  );
});
