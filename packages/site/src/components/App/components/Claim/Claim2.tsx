import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
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
import claim1illu from "../../../../assets/images/Claim1Illu.png";
import TorusBlack from "../../../../assets/images/torusblack.png";
import {
  useClaimedTokenRefKey,
  useTokenRef,
  useTokenMetadata,
} from "@strata-foundation/react";
import { TorusWalletAdapter } from "@solana/wallet-adapter-wallets";

export interface IClaim2Props {
  handle: string;
  incrementStep: () => void;
  decrementStep: () => void;
}

export const Claim2: React.FC<IClaim2Props> = ({ handle, incrementStep }) => {
  const { connected, select, wallet } = useWallet();
  const adapter = wallet?.adapter;
  const { showModal } = useModal();
  const walletMintKey = useClaimedTokenRefKey(adapter?.publicKey, null);

  const { info: walletRef, loading: walletRefLoading = true } =
    useTokenRef(walletMintKey);

  const { metadata, loading: metadataLoading = true } = useTokenMetadata(
    walletRef?.mint
  );

  const hasWalletClaimed =
    !!wallet && !walletRefLoading && !!walletRef?.isClaimed;

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
      {!hasWalletClaimed && (
        <>
          <Heading as="h2" size="lg" fontWeight="500">
            How do you set up a wallet?
          </Heading>
          <VStack spacing={6} color="gray.600">
            <Text fontSize="md">
              Setting up a wallet is easy! You can use any digital wallet that
              supports Solana tokens or platforms. There are several to choose
              from. If you already have one, you're one step ahead.
            </Text>
            <Text fontSize="md">
              If you don't have a wallet yet, we'll walk you through a quick
              process to connect your social media account and create a wallet
              at the same time. It's as easy as 1, 2, 3!
            </Text>
          </VStack>
        </>
      )}
      {hasWalletClaimed && (
        <>
          <Heading as="h2" size="lg" fontWeight="500">
            Wallet has already claimed!
          </Heading>
          <VStack spacing={6} color="gray.600">
            <Text fontSize="md">
              It appears the {adapter!.name} wallet you are using has already
              claimed a social token with the twitter handle of{" "}
              <Text as="span" fontWeight="bold">
                {metadataLoading ? "Loading..." : metadata?.data.name}
              </Text>
              {". "}
              In order to claim multiple social tokens you will need multiple
              wallets.
            </Text>
            <Text fontSize="md">
              Please generate a new address for the {adapter!.name} wallet in
              order to claim the new social token for{" "}
              <Text as="span" fontWeight="bold">
                {handle}
              </Text>
              {". "}
              If you need help you can reach out on{" "}
              <Link href="discord.gg/S8wJBR2BQV" color="indigo.500">
                discord
              </Link>
              {", "}
              <Link href="https://twitter.com/TeamWumbo" color="indigo.500">
                twitter
              </Link>
              , or refrence the{" "}
              <Link href={adapter!.url} color="indigo.500">
                {adapter!.name} website
              </Link>
              .
            </Text>
          </VStack>
        </>
      )}
      <Flex w="full" justifyContent="center">
        <VStack spacing={6} py={4} maxW="412px" w="full">
          {!connected && (
            <>
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
                onClick={() => select(new TorusWalletAdapter().name)}
                leftIcon={<Image src={TorusBlack} w={8} h={8} />}
              >
                Log in with Social
              </Button>
            </>
          )}
          {connected && (
            <>
              <Button
                isFullWidth
                colorScheme="indigo"
                variant="outline"
                bgColor="indigo.500"
                color="white"
                _hover={{ bgColor: "indigo.600" }}
                onClick={incrementStep}
                disabled={hasWalletClaimed}
              >
                Next
              </Button>
              <Button
                isFullWidth
                colorScheme="gray"
                borderColor="black"
                variant="outline"
                onClick={() => adapter?.disconnect()}
              >
                Disconnect Wallet
              </Button>
            </>
          )}
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
          href="https://strataprotocol.com/blog/us-social-token-law"
          color="indigo.500"
          isExternal
        >
          Read "Legality of Wumbo"
        </Link>
      </Box>
    </VStack>
  );
};

// (Claim2 as any).whyDidYouRender = true;
