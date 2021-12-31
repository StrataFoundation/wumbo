import React, { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-wallets";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Link,
  Image,
} from "@chakra-ui/react";
import { useModal } from "../../../../contexts";
import claim1illu from "../../../../assets/images/claim1illu.png";
import TorusBlack from "../../../../assets/images/torusblack.png";
import { useErrorHandler } from "@strata-foundation/react";

export interface IClaim2Props {
  handle: string;
  incrementStep: () => void;
  decrementStep: () => void;
}

export const Claim2: React.FC<IClaim2Props> = ({ handle, incrementStep }) => {
  const { connected, select, connect } = useWallet();
  const { handleErrors } = useErrorHandler();
  const { showModal, hideModal } = useModal();

  useEffect(() => {
    if (connected) {
      hideModal();
      incrementStep();
    }
  }, [connected, hideModal, incrementStep]);

  if (connected) return null;

  return (
    <VStack spacing={8} align="left">
      <div>
        <Text fontSize="sm" fontWeight="bold" color="indigo.600">
          Wum.bo
        </Text>
        <Heading as="h1" size="xl">
          Set up a Wallet
        </Heading>
      </div>
      <Image src={claim1illu} />
      <Heading as="h2" size="lg" fontWeight="500">
        How do you set up a wallet?
      </Heading>
      <VStack spacing={6} color="gray.600">
        <Text size="md">
          Setting up a wallet is easy! You can use any digital wallet that
          supports Solana tokens or platforms. There are several to choose from.
          If you already have one, you're one step ahead.
        </Text>
        <Text size="md">
          If you don't have a wallet yet, we'll walk you through a quick process
          to connect your social media account and create a wallet at the same
          time. It's as easy as 1, 2, 3!
        </Text>
      </VStack>
      <Flex w="full" justifyContent="center">
        <VStack spacing={6} py={4} maxW="412px" w="full">
          <Button
            isFullWidth
            colorScheme="indigo"
            variant="outline"
            bgColor="indigo.500"
            color="white"
            _hover={{ bgColor: "indigo.600" }}
            onClick={() => showModal("WalletSelect")}
          >
            Use my own wallet
          </Button>
          <Button
            isFullWidth
            colorScheme="gray"
            borderColor="black"
            variant="outline"
            onClick={() => select(WalletName.Torus)}
            leftIcon={<Image src={TorusBlack} w={8} h={8} />}
          >
            Log in with Social
          </Button>
        </VStack>
      </Flex>
      <Box
        w="full"
        border="1px solid"
        borderColor="gray.300"
        py={12}
        justifyContent="center"
        align="center"
        rounded="md"
      >
        <Text fontWeight="bold">Worried about potential legal problems?</Text>
        <Link
          href="https://teamwumbo.medium.com/wum-bo-hello-world-hello-twitter-fa3a7b8b6957"
          color="indigo.500"
          isExternal
        >
          Read "Legality of Wumbo"
        </Link>
      </Box>
    </VStack>
  );
};
