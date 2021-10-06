import React, { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
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
  IconProps,
  IconButton,
  Tooltip,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
  WUM_TOKEN,
  SOL_TOKEN,
  useWallet,
  useTokenBondingInfo,
  useBondingPricing,
  useFtxPayLink,
  useSolOwnedAmount,
  useOwnedAmount,
  WumboIcon,
  SolanaIcon,
} from "../";

interface ISwapProps {
  onHandleConnectWallet: () => void;
  onHandleFlipTokens: (tokenBonding: PublicKey, action: "buy" | "sell") => void;
}

/*
 * if action === buy then base is base
 * if action === sell then base is target
 */
export const Swap = ({
  onHandleConnectWallet,
  onHandleFlipTokens,
}: ISwapProps) => {
  const { connected } = useWallet();
  const [slippage, setSlippage] = useState<string>("1");
  const [rate, setRate] = useState<string>("--");
  const params = useParams<{ tokenBonding: string; action: "buy" | "sell" }>();
  const ftxPayLink = useFtxPayLink();

  const {
    loading: loadingBondingInfo,
    result: bondingInfo,
    error: bondingInfoError,
  } = useTokenBondingInfo(params.tokenBonding);

  const { loading: loadingPricing, curve } = useBondingPricing(
    bondingInfo?.publicKey
  );

  const base = bondingInfo?.baseMint || PublicKey.default;
  const target = bondingInfo?.targetMint || PublicKey.default;
  const ownedBase = useOwnedAmount(base);
  const { amount: ownedSol, loading: loadingSol } = useSolOwnedAmount();

  const isBaseSol = bondingInfo?.baseMint?.toBase58() === SOL_TOKEN.toBase58();

  const isBaseWum = bondingInfo?.baseMint?.toBase58() === WUM_TOKEN.toBase58();

  const IconWrapper: FC = ({ children }) => (
    <Center w={8} h={8}>
      {children}
    </Center>
  );

  const [baseIcon, baseText, altBaseIcon, altBaseText]: [
    ComponentWithAs<"svg", IconProps>,
    string,
    ComponentWithAs<"svg", IconProps>,
    string
  ] = isBaseSol
    ? [SolanaIcon, "SOL", WumboIcon, "WUM"]
    : [WumboIcon, "WUM", SolanaIcon, "SOL"];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      baseAmount: "",
      targetAmount: "",
      slippage: slippage,
    },
  });

  const baseAmount = watch("baseAmount");
  const formatSlippage = (val: string) => val + "%";
  const parseSlippage = (val: string) => val.replace(/^\%/, "");
  const hasBaseAmount =
    ((isBaseSol ? ownedSol : ownedBase) || 0) >= +(baseAmount || 0);

  const handleTradeWum = () => alert("tradeWum");
  const handleGetSol = () => alert("GetSol");

  const handleConnectWallet = () => {
    onHandleConnectWallet();
  };

  const handleUseMax = () => {
    const newBaseAmount = isBaseSol ? ownedSol : ownedBase;
    setValue("baseAmount", newBaseAmount ? `${newBaseAmount}` : "");
  };

  const handleFlipTokens = () => {
    setValue("baseAmount", "");
    onHandleFlipTokens(
      new PublicKey(params.tokenBonding),
      params.action === "buy" ? "sell" : "buy"
    );
  };

  const handleTrade = () => alert("trade");

  useEffect(() => {
    setValue("slippage", slippage);
  }, [slippage, setValue]);

  useEffect(() => {
    if (baseAmount && bondingInfo && curve) {
      const maxBuy = Math.min(
        curve.buyWithBaseAmount(
          +baseAmount,
          bondingInfo.baseRoyaltyPercentage,
          bondingInfo.targetRoyaltyPercentage
        )
      );

      setValue("targetAmount", `${maxBuy}`);
    } else {
      setRate("--");
      setValue("targetAmount", "");
    }
  }, [baseAmount, setValue, setRate, bondingInfo, curve]);

  const isLoading = loadingBondingInfo || loadingPricing || loadingSol;

  return (
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
              Use Max ({isBaseSol ? ownedSol : ownedBase} {baseText})
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
                {/* TODO populate with owned coins*/}
                {/* <MenuList>
                <MenuItem icon={<Avatar size="sm" name="SOL" />}>
                  <Flex justifyContent="space-between">
                    <Text fontSize="lg" fontWeight="semibold">
                      SOL
                    </Text>
                    <Text fontSize="lg">0 SOL</Text>
                  </Flex>
                </MenuItem>
              </MenuList> */}
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
          <Text>{rate}</Text>
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
          <NumberInput
            isDisabled={!connected}
            onChange={(valueString) => setSlippage(parseSlippage(valueString))}
            value={formatSlippage(slippage)}
            max={10}
            min={0}
            color="gray.500"
            bgColor="gray.200"
            borderColor="gray.200"
            w="80px"
            size="sm"
            rounded="md"
          >
            <NumberInputField rounded="lg" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
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
          <Flex>1.5%</Flex>
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
          <Flex>3.23%</Flex>
        </Flex>
      </VStack>
      <Box position="relative">
        <ScaleFade initialScale={0.9} in={!hasBaseAmount}>
          <Center
            bgColor="gray.500"
            rounded="md"
            paddingY={2}
            color="white"
            w="full"
            position="absolute"
            top={-12}
          >
            <Text>
              Insufficent funds for this trade.{" "}
              <Text as="u">
                <Link color="indigo.100" _hover={{ color: "indigo.200" }}>
                  {isBaseSol ? "Buy more SOL now." : "Buy more WUM now."}
                </Link>
              </Text>
            </Text>
          </Center>
        </ScaleFade>
        <Button
          isDisabled={!connected || !hasBaseAmount}
          w="full"
          colorScheme="indigo"
          size="lg"
          onClick={handleTrade}
        >
          Trade
        </Button>
      </Box>
    </VStack>
  );
};
