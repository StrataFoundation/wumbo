import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Adapter, WalletName } from "@solana/wallet-adapter-base";
import { TorusWalletName } from "@solana/wallet-adapter-wallets";
import { Flex, Box, Button, Text, VStack } from "@chakra-ui/react";
import { WALLET_PROVIDERS } from "../constants/walletProviders";

export interface IWalletSelect {
  onSelect?: (name: WalletName) => void;
  selectedWallet?: WalletName | null;
}

export const WalletSelect: React.FC<IWalletSelect> = ({
  onSelect,
  selectedWallet,
}) => {
  const { wallet, select } = useWallet();
  const adapter = wallet?.adapter;

  const handleOnSelect = (name: WalletName) => {
    onSelect ? onSelect(name) : select(name);
  };

  return (
    <Box d="flex" flexDir="column" padding={4}>
      {adapter?.connected ? (
        <VStack spacing={4} alignItems="start">
          <span className="test-sm">Wallet Connected!</span>
          <Button
            w="full"
            size="lg"
            colorScheme="indigo"
            onClick={adapter?.disconnect.bind(adapter)}
          >
            Disconnect
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4} alignItems="start">
          <Text fontSize="lg">
            New to Crypto & dont have an existing wallet?&nbsp;
            <Button
              colorScheme="indigo"
              variant="link"
              onClick={() => handleOnSelect(TorusWalletName)}
              color="indigo.600"
            >
              Connect with Social.
            </Button>
          </Text>
          {WALLET_PROVIDERS.map((provider: Adapter, idx: number) => (
            <Button
              key={idx}
              w="full"
              size="lg"
              colorScheme="indigo"
              justifyItems="center"
              onClick={() => handleOnSelect(provider.name)}
              opacity={
                selectedWallet && provider.name !== selectedWallet ? "0.8" : "1"
              }
              _hover={{
                opacity: "1",
              }}
            >
              <Flex w="full" justifyContent="space-between">
                <Text fontSize="md">{provider.name}</Text>
                <Box w={5} h={5}>
                  <img
                    alt={`${provider.name}`}
                    src={provider.icon}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </Flex>
            </Button>
          ))}
        </VStack>
      )}
    </Box>
  );
};
