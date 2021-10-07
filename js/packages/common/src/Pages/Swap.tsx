import React, { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import { u64 } from "@solana/spl-token";
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
  IconProps,
  IconButton,
  Tooltip,
  Input,
  InputGroup,
  InputRightElement,
  Avatar,
  Button,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ComponentWithAs,
} from "@chakra-ui/react";
import {
  RiArrowUpDownFill,
  RiInformationLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import {
  WUM_BONDING,
  WUM_TOKEN,
  SOL_TOKEN,
  useWallet,
  useBuyToken,
  useSellToken,
  handleErrors,
  useTokenBondingInfo,
  useBondingPricing,
  useMint,
  useFtxPayLink,
  useSolOwnedAmount,
  useOwnedAmount,
  amountAsNum,
  WumboIcon,
  SolanaIcon,
  Notification,
} from "../";

export interface ISwapProps {
  onHandleConnectWallet: () => void;
  onHandleFlipTokens: (tokenBonding: PublicKey, action: "buy" | "sell") => void;
  onHandleBuyWum: (tokenBonding: PublicKey, action: "buy") => void;
}

const IconWrapper: FC = ({ children }) => (
  <Center w={8} h={8}>
    {children}
  </Center>
);

export const Swap = ({
  onHandleConnectWallet,
  onHandleFlipTokens,
  onHandleBuyWum,
}: ISwapProps) => {
  const { connected, awaitingApproval } = useWallet();
  const [buy, { loading: buyLoading, error: buyError }] = useBuyToken();
  const [sell, { loading: sellLoading, error: sellError }] = useSellToken();
  const [rate, setRate] = useState<string>("--");
  const [spendCap, setSpendCap] = useState<number>(0);
  const [internalError, setInternalError] = useState<Error | undefined>();
  const params = useParams<{ tokenBonding: string; action: "buy" | "sell" }>();
  const ftxPayLink = useFtxPayLink();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      baseAmount: "",
      targetAmount: "",
      slippage: "1",
    },
  });

  const {
    loading: loadingBondingInfo,
    result: bondingInfo,
    error: bondingInfoError,
  } = useTokenBondingInfo(params.tokenBonding);

  handleErrors(buyError, sellError, bondingInfoError, internalError);

  const { loading: loadingPricing, curve } = useBondingPricing(
    bondingInfo?.publicKey
  );

  const targetMint = useMint(bondingInfo?.targetMint);
  const base = bondingInfo?.baseMint || PublicKey.default;
  const target = bondingInfo?.targetMint || PublicKey.default;
  const ownedBase = useOwnedAmount(base);
  const { amount: ownedSol, loading: loadingSol } = useSolOwnedAmount();

  const isBaseSol = bondingInfo?.baseMint?.toBase58() === SOL_TOKEN.toBase58();
  const isBaseWum = bondingInfo?.baseMint?.toBase58() === WUM_TOKEN.toBase58();
  const baseAmount = watch("baseAmount");

  const hasBaseAmount =
    ((isBaseSol ? ownedSol : ownedBase) || 0) >= +(baseAmount || 0);
  const moreThanSpendCap = (+baseAmount || 0) > spendCap;

  const [baseIcon, baseText, altBaseIcon, altBaseText]: [
    ComponentWithAs<"svg", IconProps>,
    string,
    ComponentWithAs<"svg", IconProps>,
    string
  ] = isBaseSol
    ? [SolanaIcon, "SOL", WumboIcon, "WUM"]
    : [WumboIcon, "WUM", SolanaIcon, "SOL"];

  const handleConnectWallet = () => {
    onHandleConnectWallet();
  };

  const handleUseMax = () => {
    const newBaseAmount = isBaseSol ? ownedSol : ownedBase;

    setValue(
      "baseAmount",
      newBaseAmount
        ? `${newBaseAmount >= spendCap ? spendCap : newBaseAmount}`
        : ""
    );
  };

  const handleFlipTokens = () => {
    setValue("baseAmount", "");
    onHandleFlipTokens(
      new PublicKey(params.tokenBonding),
      params.action === "buy" ? "sell" : "buy"
    );
  };

  const handleBuyWum = async () => {
    onHandleBuyWum(WUM_BONDING, "buy");
  };

  const handleTrade = async (values: any) => {
    try {
      if (params.action === "buy") {
        await buy(
          bondingInfo!.publicKey,
          +values.targetAmount,
          +values.slippage
        );
      } else {
        await sell(
          bondingInfo!.publicKey,
          +values.targetAmount,
          +values.slippage
        );
      }
      reset();

      toast.custom((t) => (
        <Notification
          show={t.visible}
          type="success"
          heading="Transaction Succesful"
          message={`You now own ${Number(values.targetAmount).toFixed(
            4
          )} of "WUM"!`}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ));
    } catch (e) {
      setInternalError(e);
    }
  };

  useEffect(() => {
    if (bondingInfo && targetMint && curve) {
      const purchaseCap = bondingInfo.purchaseCap
        ? amountAsNum(bondingInfo.purchaseCap as u64, targetMint)
        : Number.POSITIVE_INFINITY;

      const maxSpend = curve.buyTargetAmount(
        purchaseCap,
        bondingInfo.baseRoyaltyPercentage,
        bondingInfo.targetRoyaltyPercentage
      );

      setSpendCap(maxSpend);
    }
  }, [bondingInfo, targetMint, curve, setSpendCap]);

  useEffect(() => {
    if (baseAmount && bondingInfo && curve) {
      const buyMax = Math.min(
        curve.buyWithBaseAmount(
          +baseAmount,
          bondingInfo.baseRoyaltyPercentage,
          bondingInfo.targetRoyaltyPercentage
        )
      );

      setValue("targetAmount", `${buyMax}`);
      setRate(`${buyMax / +baseAmount}`);
    } else {
      setValue("targetAmount", "");
      setRate("--");
    }
  }, [baseAmount, setValue, setRate, bondingInfo, curve]);

  const isLoading = loadingBondingInfo || loadingPricing || loadingSol;

  return (
    <form onSubmit={handleSubmit(handleTrade)}>
      <VStack spacing={6} padding={4} align="stretch" color="gray.500">
        <Flex flexDir="column">
          <Flex justifyContent="space-between">
            <Text color="gray.600" fontSize="xs">
              You Pay
            </Text>
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
                    isLoading={isLoading}
                    as={Button}
                    leftIcon={
                      <Center w={8} h={8}>
                        <Icon
                          as={baseIcon}
                          w="full"
                          h="full"
                          color="white"
                          rounded="full"
                          bg="indigo.500"
                        />
                      </Center>
                    }
                    rightIcon={<Icon as={RiArrowDownSLine} w={6} h={6} />}
                    borderRadius="20px 6px 6px 20px"
                    paddingX={1.5}
                    bgColor="gray.200"
                    _hover={{ bgColor: "gray.300" }}
                  >
                    {baseText}
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      icon={
                        <Center w={8} h={8}>
                          <Icon
                            as={altBaseIcon}
                            w="full"
                            h="full"
                            color="white"
                            rounded="full"
                            bg="indigo.500"
                          />
                        </Center>
                      }
                    >
                      <Flex justifyContent="space-between">
                        <Text fontSize="lg" fontWeight="semibold">
                          {altBaseText}
                        </Text>
                        <Text fontSize="lg">0 {altBaseText}</Text>
                      </Flex>
                    </MenuItem>
                  </MenuList>
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
                isLoading={isLoading}
              >
                Use Max (
                {isBaseSol
                  ? ownedSol > spendCap
                    ? spendCap
                    : ownedSol
                  : ownedBase}{" "}
                {baseText})
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
                  {isBaseSol && (
                    <MenuButton
                      isDisabled={!connected}
                      isLoading={isLoading}
                      as={Button}
                      leftIcon={
                        <Center w={8} h={8}>
                          <Icon
                            as={altBaseIcon}
                            w="full"
                            h="full"
                            color="white"
                            rounded="full"
                            bgColor="indigo.500"
                          />
                        </Center>
                      }
                      borderRadius="20px 6px 6px 20px"
                      paddingX={1.5}
                      bgColor="gray.200"
                      _hover={{ bgColor: "gray.200", cursor: "default" }}
                    >
                      {altBaseText}
                    </MenuButton>
                  )}
                  {!isBaseSol && (
                    <MenuButton
                      isDisabled={!connected}
                      isLoading={isLoading}
                      as={Button}
                      leftIcon={<Avatar size="sm" name="soWUM" />}
                      borderRadius="20px 6px 6px 20px"
                      paddingX={1.5}
                      bgColor="gray.200"
                      _hover={{ bgColor: "gray.200", cursor: "default" }}
                    >
                      soWUM
                    </MenuButton>
                  )}
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
                ? isBaseSol
                  ? `1 SOL ≈ ${rate} WUM`
                  : `1 WUM ≈ XXXXXX`
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
                bgColor="gray.200"
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
            <Flex>{bondingInfo?.targetRoyaltyPercentage || 0}%</Flex>
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
            <Flex>{bondingInfo?.baseRoyaltyPercentage || 0}%</Flex>
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
                  Spend Cap is {spendCap} {isBaseSol ? "SOL" : "WUM"}. Please
                  adjust amount
                </Text>
              )}
              {!moreThanSpendCap && (
                <Text>
                  Insufficent funds for this trade.{" "}
                  <Text as="u">
                    {isBaseSol && (
                      <Link
                        color="indigo.100"
                        _hover={{ color: "indigo.200" }}
                        isExternal={isBaseSol}
                        href={ftxPayLink}
                      >
                        Buy more SOL now.
                      </Link>
                    )}
                    {!isBaseSol && (
                      <Link
                        color="indigo.100"
                        _hover={{ color: "indigo.200" }}
                        onClick={handleBuyWum}
                      >
                        Buy more WUM now.
                      </Link>
                    )}
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
            isLoading={awaitingApproval || buyLoading || sellLoading}
            loadingText={
              awaitingApproval
                ? "Awaiting Approval"
                : params.action === "buy"
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
