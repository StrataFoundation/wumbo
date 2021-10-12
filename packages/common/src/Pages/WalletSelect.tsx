import React, { Fragment } from "react";
import { Wallet, WalletName } from "@solana/wallet-adapter-wallets";
import { useWallet } from "../contexts/walletContext";
import { WALLET_PROVIDERS } from "../constants/walletProviders";
import { Box, Button, Text, Link, VStack } from "@chakra-ui/react";

export const WalletSelect = () => {
  const { connected, disconnect, select } = useWallet();

  return (
    <Box d="flex" flexDir="column" padding={4}>
      {connected ? (
        <VStack spacing={4} alignItems="start">
          <span className="test-sm">Wallet Connected!</span>
          <Button w="full" size="lg" colorScheme="indigo" onClick={disconnect}>
            Disconnect
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4} alignItems="start">
          <Text fontSize="lg">
            New to Crypto & dont have an existing wallet?&nbsp;
            <Link
              href="#"
              onClick={() => select(WalletName.Torus)}
              color="indigo.600"
            >
              Connect with Social.
            </Link>
          </Text>
          {WALLET_PROVIDERS.map((provider: Wallet, idx: number) => (
            <Button
              key={idx}
              w="full"
              size="lg"
              colorScheme="indigo"
              justifyContent="left"
              onClick={() => select(provider.name)}
              leftIcon={
                <Box w={5} h={5}>
                  <img
                    alt={`${provider.name}`}
                    src={provider.icon}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              }
            >
              <Text fontSize="md">{provider.name}</Text>
            </Button>
          ))}
        </VStack>
      )}
    </Box>
  );
};
