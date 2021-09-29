import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Flex,
  VStack,
  HStack,
  Text,
  Icon,
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
  InputLeftElement,
} from "@chakra-ui/react";
import { RiArrowUpDownFill, RiInformationFill } from "react-icons/ri";
import { Spinner } from "../";
import { WumboRankIcon, SolanaIcon } from "../svgs";

export const Swap = () => {
  const [slippage, setSlippage] = useState<string>("1");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      baseAmount: undefined,
      targetAmount: undefined,
      slippage: slippage,
    },
  });

  const formatSlippage = (val: string) => val + "%";
  const parseSlippage = (val: string) => val.replace(/^\%/, "");

  const handleTradeWum = () => alert("tradeWum");
  const handleGetSol = () => alert("GetSol");
  const handleFlipTokens = () => alert("flipTokens");
  const handleUseMax = () => alert("useMax");
  const handleTrade = () => alert("trade");

  useEffect(() => {
    setValue("slippage", slippage);
  }, [slippage, setValue]);

  return (
    <VStack
      spacing={6}
      paddingX={4}
      paddingTop={8}
      paddingBottom={4}
      align="stretch"
      color="gray.400"
    >
      <HStack justify="center" align="center" paddingBottom={2}>
        <Divider />
        <Flex>
          <Button
            rounded="full"
            colorScheme="indigo"
            size="sm"
            onClick={handleTradeWum}
          >
            <WumboRankIcon
              w={4}
              h={4}
              color="white"
              fill="none"
              marginRight={2}
            />
            Trade WUM
          </Button>
        </Flex>
        <Divider />
        <Flex>
          <Button
            rounded="full"
            colorScheme="gray"
            size="sm"
            onClick={handleGetSol}
          >
            <SolanaIcon w={4} h={4} fill="none" marginRight={2} />
            Get SOL
          </Button>
        </Flex>
        <Divider />
      </HStack>
      <InputGroup size="lg">
        <InputLeftElement>
          <Text fontSize="md" fontWeight="semibold">
            Pay
          </Text>
        </InputLeftElement>
        <Input
          id="baseAmount"
          bgColor="gray.100"
          borderColor="gray.200"
          placeholder="0"
          type="number"
          {...register("baseAmount")}
        />
        <InputRightElement
          w="auto"
          justifyContent="end"
          paddingX={1.5}
          rounded="lg"
        >
          <HStack
            bgColor="gray.200"
            paddingX={1.5}
            paddingY={1}
            borderLeftRadius="full"
          >
            <Avatar size="sm" name="WUM" />
            <Text fontSize="md">WUM</Text>
          </HStack>
        </InputRightElement>
      </InputGroup>
      <HStack
        justify="center"
        alignItems="center"
        position="relative"
        paddingY={4}
      >
        <Divider />
        <Flex>
          <Button
            size="xs"
            colorScheme="indigo"
            variant="outline"
            onClick={handleUseMax}
          >
            Use Max (0.02343 WUM)
          </Button>
        </Flex>
        <Divider />
        <IconButton
          aria-label="Flip Tokens"
          colorScheme="gray"
          rounded="full"
          position="absolute"
          right={2}
          onClick={handleFlipTokens}
          icon={<Icon as={RiArrowUpDownFill} w={6} h={6} />}
        />
      </HStack>
      <InputGroup size="lg">
        <InputLeftElement>
          <Text fontSize="md" fontWeight="semibold">
            Get
          </Text>
        </InputLeftElement>
        <Input
          id="targetAmount"
          bgColor="gray.100"
          borderColor="gray.200"
          placeholder="0"
          type="number"
          {...register("targetAmount")}
        />
        <InputRightElement
          w="auto"
          justifyContent="end"
          paddingX={1.5}
          rounded="lg"
        >
          <HStack
            bgColor="gray.200"
            paddingX={1.5}
            paddingY={1}
            borderLeftRadius="full"
          >
            <Avatar size="sm" name="soWUM" />
            <Text fontSize="md">soWUM</Text>
          </HStack>
        </InputRightElement>
      </InputGroup>
      <VStack
        spacing={4}
        padding={4}
        align="stretch"
        borderColor="gray.200"
        borderWidth="1px"
        rounded="lg"
        fontSize="sm"
      >
        <Flex justify="space-between" alignItems="center">
          <Text>Rate</Text>
          <Text>--</Text>
        </Flex>
        <Flex justify="space-between" alignItems="center">
          <Tooltip
            placement="top"
            label="Your transaction will fail if the price changes unfavorably more than this percentage. We don't allow set slippage more than 10% for the saftey of our users."
          >
            <Text _hover={{ color: "indigo.500", cursor: "pointer" }}>
              Slippage <Icon w={4} h={4} as={RiInformationFill} />
            </Text>
          </Tooltip>
          <NumberInput
            onChange={(valueString) => setSlippage(parseSlippage(valueString))}
            value={formatSlippage(slippage)}
            max={10}
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
      </VStack>
      <Button w="full" colorScheme="indigo" size="lg" onClick={handleTrade}>
        Trade
      </Button>
    </VStack>
  );
};
