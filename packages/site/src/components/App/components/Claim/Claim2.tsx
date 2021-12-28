import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Image,
  Button,
  Link,
} from "@chakra-ui/react";
import { useModal } from "../../../../contexts";
import Claim1Illu from "../../../../assets/images/Claim1Illu.png";
import { claimPath } from "../../../../constants/routes";

export interface IClaim2Props {
  handle: string;
  authCode: string | null | undefined;
}

export const Claim2: React.FC<IClaim2Props> = ({ handle, authCode }) => {
  const history = useHistory();
  const { connected } = useWallet();
  const { showModal, hideModal } = useModal();

  useEffect(() => {
    if (connected) {
      hideModal();
      history.push(claimPath({ step: 3, authCode, handle }));
    }
  }, [connected, hideModal, history, claimPath]);

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
      <Image src={Claim1Illu} />
      <Heading as="h2" size="lg" fontWeight="500">
        How do you set up a wallet?
      </Heading>
      <VStack spacing={6} color="gray.600">
        <Text size="md">
          Setting up a wallet is easy! You can use any digital wallt that
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
            onClick={() => console.log("Login with Torus")}
          >
            Log in with Social
          </Button>
        </VStack>
      </Flex>
      <Box
        full
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
