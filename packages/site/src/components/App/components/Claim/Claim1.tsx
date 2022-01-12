import React, { useMemo } from "react";
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
import { RiAlertLine, RiGift2Line } from "react-icons/ri";
import { useTwitterTld } from "wumbo-common";
import claim1illu from "../../../../assets/images/Claim1Illu.png";
import claim1banner from "../../../../assets/images/claim1banner.png";

export interface IClaim1Props {
  handle: string;
  incrementStep: () => void;
  decrementStep: () => void;
}

export const Claim1 = React.memo<IClaim1Props>(
  ({ handle, incrementStep, decrementStep }) => {
    const history = useHistory();
    const tld = useTwitterTld();
    const { info: tokenRef, loading: tokenRefLoading = true } =
      useTokenRefForName(handle, null, tld);

    const { info: tokenBonding, loading: tokenBondingLoading = true } =
      useTokenBondingFromMint(tokenRef?.mint);

    const { info: buyRoyaltiesAcct, loading: royaltiesAcctLoading = true } =
      useTokenAccount(tokenBonding?.buyTargetRoyalties);

    const mint = useMint(tokenRef?.mint);

    const { pricing, loading: pricingLoading = true } = useBondingPricing(
      tokenBonding?.publicKey
    );

    const nativeFiatPrice = usePriceInUsd(NATIVE_MINT);
    const fiatPrice = usePriceInUsd(buyRoyaltiesAcct?.mint);
    const toFiat = (a: number, price: number = 0) => price * a;
    const nativeLocked = pricing?.locked(NATIVE_MINT);

    const fiatLocked =
      mint &&
      typeof nativeLocked !== "undefined" &&
      toFiat(nativeLocked || 0, nativeFiatPrice).toFixed(2);

    const claimableAmount =
      buyRoyaltiesAcct &&
      typeof nativeLocked !== "undefined" &&
      toFiat(amountAsNum(buyRoyaltiesAcct.amount, mint), fiatPrice).toFixed(2);

    const isLoading = useMemo(
      () =>
        tokenRefLoading ||
        tokenBondingLoading ||
        royaltiesAcctLoading ||
        pricingLoading,
      [
        tokenRef,
        tokenRefLoading,
        tokenBondingLoading,
        royaltiesAcctLoading,
        pricingLoading,
      ]
    );

    const tokenExists = !isLoading && tokenRef && tokenBonding;
    const isClaimable = tokenExists && !tokenRef?.isClaimed;

    return (
      <VStack w="full" spacing={8} align="left">
        <div>
          <Text fontSize="sm" fontWeight="bold" color="indigo.600">
            Wum.bo
          </Text>
          <Heading as="h1" size="xl">
            Claim Your Profile
          </Heading>
        </div>
        <VStack spacing={4}>
          <Box
            w="full"
            rounded="lg"
            bgImage={{
              base: "linear-gradient(180deg, #3D3AB1 0%, #6631A5 100%);",
              md:
                isLoading || isClaimable
                  ? `url(${claim1banner}), linear-gradient(180deg, #3D3AB1 0%, #6631A5 100%);`
                  : "linear-gradient(180deg, #3D3AB1 0%, #6631A5 100%);",
            }}
            bgPos="right"
            bgRepeat="no-repeat"
            bgSize="contain"
          >
            <HStack w="full" color="white" py={5} px={8} spacing={6}>
              {(isLoading || (tokenExists && isClaimable)) && (
                <>
                  <Icon as={RiGift2Line} w="29px" h="29px" />
                  <Text maxW="346px">
                    Your fans have already put{" "}
                    <Text as="span" fontWeight="bold">
                      {fiatLocked ? "$" + fiatLocked : "Loading...."}
                    </Text>{" "}
                    into your social token, you'll get{" "}
                    <Text as="span" fontWeight="bold">
                      {claimableAmount ? "$" + claimableAmount : "Loading..."}
                    </Text>{" "}
                    worth of your own token if you claim!
                  </Text>
                </>
              )}
              {!isLoading && !isClaimable && !tokenExists && (
                <>
                  <Icon as={RiAlertLine} w="29px" h="29px" />
                  <Text>
                    {`There is no social token which can be claimed for ${handle}. Please reach out to the team via`}{" "}
                    <Link href="discord.gg/S8wJBR2BQV" textDecor="underline">
                      discord
                    </Link>{" "}
                    or{" "}
                    <Link
                      href="https://twitter.com/TeamWumbo"
                      textDecor="underline"
                    >
                      twitter
                    </Link>{" "}
                    if you believe there should be.
                  </Text>
                </>
              )}
              {!isLoading && tokenExists && !isClaimable && (
                <>
                  <Icon as={RiAlertLine} w="29px" h="29px" />
                  <Text>
                    {`The social token for ${handle} has already been claimed! If you're the owner of this handle and haven't claimed this token, please reach out to the team via`}{" "}
                    <Link href="discord.gg/S8wJBR2BQV" textDecor="underline">
                      discord
                    </Link>{" "}
                    or{" "}
                    <Link
                      href="https://twitter.com/TeamWumbo"
                      textDecor="underline"
                    >
                      twitter
                    </Link>
                  </Text>
                </>
              )}
            </HStack>
          </Box>
          <Image src={claim1illu} />
        </VStack>
        <Heading as="h2" size="lg" fontWeight="500">
          What is a social token?
        </Heading>
        <VStack spacing={6} color="gray.600">
          <Text fontSize="md">
            A Social Token allows content creators, thought leaders,
            entertainers, artists, and other individuals to create their own
            tokens that increase in value as their communities grow.
          </Text>
          <Text fontSize="md">
            This is a great way to support creators you believe in and love to
            follow! Think of it as joining someone's fan club, but you (and
            they) get real value of it.
          </Text>
        </VStack>
        <Flex w="full" justifyContent="center">
          <VStack spacing={6} py={4} maxW="412px" w="full">
            <Button
              isFullWidth
              colorScheme="indigo"
              variant="outline"
              onClick={incrementStep}
              disabled={isLoading || !isClaimable}
            >
              Next
            </Button>
            <Button
              colorScheme="indigo"
              variant="link"
              onClick={() => history.push("/")}
              disabled={isLoading || !isClaimable}
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
            href="https://strataprotocol.com/blog/us-social-token-law"
            color="indigo.500"
            isExternal
          >
            Read "Legality of Wumbo"
          </Link>
        </Box>
      </VStack>
    );
  }
);
