import React from "react";
import { useHistory } from "react-router-dom";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  useBondingPricing,
  useMint,
  usePriceInUsd,
  useTokenBondingFromMint,
  useTokenRefForName,
  useTokenAccount,
  amountAsNum,
} from "@strata-foundation/react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Icon,
  Image,
  Button,
  Link,
} from "@chakra-ui/react";
import { RiGift2Line } from "react-icons/ri";
import { useTwitterTld } from "wumbo-common";
import claim1illu from "../../../../assets/images/claim1illu.png";
import claim1banner from "../../../../assets/images/claim1banner.png";

export interface IClaim1Props {
  handle: string;
  incrementStep: () => void;
  decrementStep: () => void;
}

export const Claim1: React.FC<IClaim1Props> = ({
  handle,
  incrementStep,
  decrementStep,
}) => {
  const history = useHistory();
  const tld = useTwitterTld();
  const { info: tokenRef } = useTokenRefForName(handle, null, tld);
  const { info: tokenBonding } = useTokenBondingFromMint(tokenRef?.mint);
  const { info: buyRoyaltiesAcct } = useTokenAccount(
    tokenBonding?.buyTargetRoyalties
  );
  const mint = useMint(tokenRef?.mint);
  const { pricing } = useBondingPricing(tokenBonding?.publicKey);
  const nativeFiatPrice = usePriceInUsd(NATIVE_MINT);
  const fiatPrice = usePriceInUsd(buyRoyaltiesAcct?.mint);
  const toFiat = (a: number, price: number = 0) => price * a;
  const nativeLocked = pricing?.locked(NATIVE_MINT);

  const fiatLocked =
    mint &&
    typeof nativeLocked !== "undefined" &&
    toFiat(nativeLocked || 0, nativeFiatPrice).toFixed(2);

  const claimable =
    buyRoyaltiesAcct &&
    typeof nativeLocked !== "undefined" &&
    toFiat(amountAsNum(buyRoyaltiesAcct.amount, mint), fiatPrice).toFixed(2);

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
          bgImg={{
            base: "linear-gradient(180deg, #3D3AB1 0%, #6631A5 100%);",
            md: `url(${claim1banner}), linear-gradient(180deg, #3D3AB1 0%, #6631A5 100%);`,
          }}
          bgPos="right"
          bgRepeat="no-repeat"
          bgSize="contain"
        >
          <Icon as={RiGift2Line} w="29px" h="29px" />
          <Text maxW="346px">
            Your fans have already put{" "}
            <Text as="span" fontWeight="bold">
              {fiatLocked ? "$" + fiatLocked : "Loading...."}
            </Text>{" "}
            into your social token, you'll get{" "}
            <Text as="span" fontWeight="bold">
              {claimable ? "$" + claimable : "Loading..."}
            </Text>{" "}
            worth of your own token if you claim!
          </Text>
        </HStack>
        <Image src={claim1illu} />
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
            onClick={incrementStep}
          >
            Next
          </Button>
          <Button
            colorScheme="indigo"
            variant="link"
            onClick={() => history.push("/")}
          >
            Cancel
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
