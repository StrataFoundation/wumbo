import React, { Fragment } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet, WalletName } from "@solana/wallet-adapter-wallets";
import { Box, Button, Text, Link, VStack } from "@chakra-ui/react";
import { WALLET_PROVIDERS } from "../constants/walletProviders";

export const WalletSelect = () => {
  const { adapter, select } = useWallet();

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
