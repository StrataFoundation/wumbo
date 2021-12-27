import React, { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useErrorHandler } from "@strata-foundation/react";
import {
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Icon,
  Image,
  Button,
} from "@chakra-ui/react";
import { RiGift2Line } from "react-icons/ri";
import { Spinner } from "wumbo-common";
import Claim1Illu from "../../../../assets/images/Claim1Illu.png";

export interface IClaim1Props {
  onNext: () => void;
  onCancel: () => void;
  handle: string;
}

export const Claim1: React.FC<IClaim1Props> = ({
  onNext,
  onCancel,
  handle: propsHandle,
}) => {
  const { handleErrors } = useErrorHandler();
  const [handle, setHandle] = useState<string>(propsHandle);
  // remove after comp is done
  const [loading, setLoading] = useState<boolean>(false);

  if (loading) {
    return (
      <VStack>
        <Spinner size="md" />
        <Text size="md">Retreving Stats</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={8} align="left">
      <div>
        <Text fontSize="sm" fontWeight="bold" color="indigo.600">
          Wum.bo
        </Text>
        <Heading as="h1" size="xl">
          Claim Your Profile
        </Heading>
      </div>
      <VStack spacing={4} w="full">
        <HStack
          w="full"
          rounded="lg"
          color="white"
          py={5}
          px={8}
          spacing={6}
          bg="linear-gradient(180deg, #3D3AB1 0%, #6631A5 100%);"
        >
          <Icon as={RiGift2Line} w="29px" h="29px" />
          <Text maxW="346px">
            Your fans have already put{" "}
            <Text as="span" fontWeight="bold">
              $9,209
            </Text>{" "}
            into your social token, you'll get{" "}
            <Text as="span" fontWeight="bold">
              $298
            </Text>{" "}
            if you claim!
          </Text>
        </HStack>
        <Image src={Claim1Illu} />
      </VStack>
      <Heading as="h2" size="lg" fontWeight="500">
        What is a social token?
      </Heading>
      <VStack spacing={6} color="gray.600">
        <Text size="md">
          A Social Token allows content creators, thought leaders, entertainers,
          artists, and other individuals to create their own tokens that
          increase in value as their communities grow.
        </Text>
        <Text size="md">
          This is a great way to support creators you believe in and love to
          follow! Think of it as joining someone's fan club, but you (and they)
          get real value of it.
        </Text>
      </VStack>
      <Flex w="full" justifyContent="center">
        <VStack spacing={6} py={4} maxW="412px" w="full">
          <Button
            isFullWidth
            colorScheme="indigo"
            variant="outline"
            onClick={onNext}
          >
            Next
          </Button>
          <Button colorScheme="indigo" variant="link" onClick={onCancel}>
            Cancel
          </Button>
        </VStack>
      </Flex>
    </VStack>
  );
};
