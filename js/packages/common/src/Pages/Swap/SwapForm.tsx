import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PublicKey } from "@solana/web3.js";
import {
  Flex,
  Box,
  ScaleFade,
  Center,
  VStack,
  HStack,
  Text,
  Icon,
  Link,
  IconButton,
  Tooltip,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Divider,
  Menu,
  MenuButton,
} from "@chakra-ui/react";
import {
  RiArrowUpDownFill,
  RiInformationLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import { WUM_BONDING, useWallet, useFtxPayLink, ITokenBonding } from "../../";
import { Curve } from "@wum.bo/spl-token-bonding";

export interface ISwapFormValues {
  baseAmount?: number;
  targetAmount?: number;
  slippage: number;
}

export interface ISwapFormProps {
  action: "buy" | "sell";
  isSubmitting: boolean;
  onHandleConnectWallet: () => void;
  onHandleFlipTokens: (tokenBonding: PublicKey, action: "buy" | "sell") => void;
  onHandleBuyBase: (tokenBonding: PublicKey) => void;
  onHandleSubmit: (values: ISwapFormValues) => Promise<void>;
  tokenBonding: ITokenBonding;
  curve: Curve;
  base: {
    name: string;
    ticker: string;
    icon: React.ReactElement;
  };
  target: {
    name: string;
    ticker: string;
    icon: React.ReactElement;
  };
  ownedBase: number;
  spendCap: number;
}

export const SwapForm = ({
  action,
  isSubmitting,
  onHandleConnectWallet,
  onHandleFlipTokens,
  onHandleBuyBase,
  onHandleSubmit,
  tokenBonding,
  curve,
  base,
  target,
  ownedBase,
  spendCap,
}: ISwapFormProps) => {
  const { connected, awaitingApproval } = useWallet();
  const ftxPayLink = useFtxPayLink();
  const [rate, setRate] = useState<string>("--");
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ISwapFormValues>({
    defaultValues: {
      baseAmount: undefined,
      targetAmount: undefined,
      slippage: 1,
    },
  });

  const isBaseSol = base.ticker === "SOL";
  const isBaseWum = base.ticker === "WUM";
  const baseAmount = watch("baseAmount");
  const hasBaseAmount = ownedBase >= +(baseAmount || 0);
  const moreThanSpendCap = +(baseAmount || 0) > spendCap;

  const handleConnectWallet = () => onHandleConnectWallet();

  const handleUseMax = () =>
    setValue("baseAmount", ownedBase >= spendCap ? spendCap : ownedBase);

  const handleFlipTokens = () => {
    onHandleFlipTokens(
      tokenBonding.publicKey,
      action === "buy" ? "sell" : "buy"
    );
    reset();
  };

  const handleBuyBase = () => {
    if (isBaseSol) {
      window.open(ftxPayLink);
    } else if (isBaseWum) {
      onHandleBuyBase(WUM_BONDING);
    } else {
      handleFlipTokens();
    }
  };

  const handleSwap = async (values: ISwapFormValues) => {
    await onHandleSubmit(values);
    reset();
  };

  useEffect(() => {
    if (baseAmount && tokenBonding && curve) {
      const buyMax = Math.min(
        curve.buyWithBaseAmount(
          +baseAmount,
          tokenBonding.baseRoyaltyPercentage,
          tokenBonding.targetRoyaltyPercentage
        )
      );

      setValue("targetAmount", buyMax);
      setRate(`${buyMax / baseAmount}`);
    } else {
      setValue("targetAmount", undefined);
      setRate("--");
    }
  }, [baseAmount, setValue, setRate, tokenBonding, curve]);

  return (
    <form onSubmit={handleSubmit(handleSwap)}>
      <VStack spacing={6} padding={4} align="stretch" color="gray.500">
        <Flex flexDir="column">
          <Flex justifyContent="space-between">
            <Text color="gray.600" fontSize="xs">
              You Pay
            </Text>
            <Link color="indigo.500" fontSize="xs" onClick={handleBuyBase}>
              Buy More {base.ticker}
            </Link>
          </Flex>
          <InputGroup size="lg">
            <Input
              isDisabled={!connected}
              id="baseAmount"
              borderColor="gray.200"
              placeholder="0"
              type="number"
              fontSize="2xl"
              fontWeight="semibold"
              _placeholder={{ color: "gray.200" }}
              step={0.0000000001}
              min={0}
              {...register("baseAmount")}
            />
            <InputRightElement
              w="auto"
              justifyContent="end"
              paddingX={1.5}
              rounded="lg"
            >
              {connected && (
                <Menu>
                  <MenuButton
                    isDisabled={!connected}
                    as={Button}
                    leftIcon={
                      <Center
                        w={8}
                        h={8}
                        color="white"
                        bg="indigo.500"
                        rounded="full"
                      >
                        {base.icon}
                      </Center>
                    }
                    borderRadius="20px 6px 6px 20px"
                    paddingX={1.5}
                    bgColor="gray.200"
                    _hover={{ cursor: "default" }}
                  >
                    {base.ticker}
                  </MenuButton>
                </Menu>
              )}
            </InputRightElement>
          </InputGroup>
        </Flex>
        <HStack
          justify="center"
          alignItems="center"
          position="relative"
          paddingY={2}
        >
          <Divider />
          <Flex>
            {!connected && (
              <Button
                size="xs"
                colorScheme="gray"
                variant="outline"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </Button>
            )}
            {connected && (
              <Button
                size="xs"
                colorScheme="indigo"
                variant="ghost"
                onClick={handleUseMax}
              >
                Use Max ({ownedBase > spendCap ? spendCap : ownedBase}{" "}
                {base.ticker})
              </Button>
            )}
          </Flex>
          <Divider />
          {/* flipping to wum (Selling wum to sol) is disabled in beta*/}
          <IconButton
            isDisabled={!connected || isBaseSol}
            aria-label="Flip Tokens"
            size="sm"
            colorScheme="gray"
            rounded="full"
            position="absolute"
            right={2}
            onClick={handleFlipTokens}
            icon={<Icon as={RiArrowUpDownFill} w={5} h={5} />}
          />
        </HStack>
        <Flex flexDir="column">
          <Text color="gray.600" fontSize="xs">
            You Receive
          </Text>
          <InputGroup size="lg">
            <Input
              isReadOnly
              isDisabled={!connected}
              id="targetAmount"
              borderColor="gray.200"
              placeholder="0"
              type="number"
              fontSize="2xl"
              fontWeight="semibold"
              step={0.0000000001}
              min={0}
              _placeholder={{ color: "gray.200" }}
              _hover={{ cursor: "not-allowed" }}
              _focus={{ outline: "none", borderColor: "gray.200" }}
              {...register("targetAmount")}
            />
            <InputRightElement
              w="auto"
              justifyContent="end"
              paddingX={1.5}
              rounded="lg"
            >
              {connected && (
                <Menu>
                  <MenuButton
                    isDisabled={!connected}
                    as={Button}
                    leftIcon={
                      <Center
                        w={8}
                        h={8}
                        color="white"
                        bg="indigo.500"
                        rounded="full"
                      >
                        {target.icon}
                      </Center>
                    }
                    borderRadius="20px 6px 6px 20px"
                    paddingX={1.5}
                    bgColor="gray.200"
                    _hover={{ cursor: "default" }}
                  >
                    {target.ticker}
                  </MenuButton>
                </Menu>
              )}
            </InputRightElement>
          </InputGroup>
        </Flex>
        <VStack
          spacing={2}
          padding={4}
          align="stretch"
          color="gray.400"
          borderColor="gray.200"
          borderWidth="1px"
          rounded="lg"
          fontSize="md"
        >
          <Flex justify="space-between" alignItems="center">
            <Text>Rate</Text>
            <Text>
              {rate !== "--"
                ? `1 ${base.ticker} ≈ ${rate} ${target.ticker}`
                : rate}
            </Text>
          </Flex>
          <Flex justify="space-between" alignItems="center">
            <HStack>
              <Text>Slippage</Text>
              <Tooltip
                isDisabled={!connected}
                placement="top"
                label="Your transaction will fail if the price changes unfavorably more than this percentage."
              >
                <Flex>
                  <Icon
                    w={5}
                    h={5}
                    as={RiInformationLine}
                    _hover={{ color: "indigo.500", cursor: "pointer" }}
                  />
                </Flex>
              </Tooltip>
            </HStack>
            <InputGroup size="md" w="60px">
              <Input
                isDisabled={!connected}
                id="slippage"
                borderColor="gray.200"
                textAlign="right"
                rounded="lg"
                placeholder="0"
                type="number"
                fontWeight="semibold"
                step={1}
                min={1}
                max={90}
                paddingRight={5}
                paddingLeft={1}
                {...register("slippage")}
              />
              <InputRightElement
                w={4}
                justifyContent="end"
                paddingRight={1.5}
                rounded="lg"
              >
                <Text>%</Text>
              </InputRightElement>
            </InputGroup>
          </Flex>
          <Flex justify="space-between" alignItems="center">
            <Text>Estimated Fees</Text>
            <Flex>--</Flex>
          </Flex>
          <Flex justify="space-between" alignItems="center">
            <HStack>
              <Text>Token Royalties</Text>
              <Tooltip
                isDisabled={!connected}
                placement="top"
                label="Your transaction will fail if the price changes unfavorably more than this percentage."
              >
                <Flex>
                  <Icon
                    w={5}
                    h={5}
                    as={RiInformationLine}
                    _hover={{ color: "indigo.500", cursor: "pointer" }}
                  />
                </Flex>
              </Tooltip>
            </HStack>
            <Flex>{tokenBonding.targetRoyaltyPercentage || 0}%</Flex>
          </Flex>
          <Flex justify="space-between" alignItems="center">
            <HStack>
              <Text>WUM Royalties</Text>
              <Tooltip
                isDisabled={!connected}
                placement="top"
                label="Your transaction will fail if the price changes unfavorably more than this percentage."
              >
                <Flex>
                  <Icon
                    w={5}
                    h={5}
                    as={RiInformationLine}
                    _hover={{ color: "indigo.500", cursor: "pointer" }}
                  />
                </Flex>
              </Tooltip>
            </HStack>
            <Flex>{tokenBonding.baseRoyaltyPercentage || 0}%</Flex>
          </Flex>
        </VStack>
        <Box position="relative">
          <ScaleFade initialScale={0.9} in={!hasBaseAmount || moreThanSpendCap}>
            <Center
              bgColor="gray.500"
              rounded="md"
              paddingY={2}
              color="white"
              w="full"
              position="absolute"
              top={-12}
            >
              {moreThanSpendCap && (
                <Text>
                  Spend Cap is {spendCap} {base.ticker}. Please adjust amount
                </Text>
              )}
              {!moreThanSpendCap && (
                <Text>
                  Insufficent funds for this trade.{" "}
                  <Text as="u">
                    <Link
                      color="indigo.100"
                      _hover={{ color: "indigo.200" }}
                      onClick={handleBuyBase}
                    >
                      {`Buy more ${base.ticker} now.`}
                    </Link>
                  </Text>
                </Text>
              )}
            </Center>
          </ScaleFade>
          <Button
            isDisabled={!connected || !hasBaseAmount || moreThanSpendCap}
            w="full"
            colorScheme="indigo"
            size="lg"
            type="submit"
            isLoading={awaitingApproval || isSubmitting}
            loadingText={
              awaitingApproval
                ? "Awaiting Approval"
                : action === "buy"
                ? "Buying"
                : "Selling"
            }
          >
            Trade
          </Button>
        </Box>
      </VStack>
    </form>
  );
};
