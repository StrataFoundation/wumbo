import React from "react";
import { Flex, Button, Input } from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useWallet } from "wumbo-common";

export type FormValues = {
  fiatAmount: string;
  tokenAmount: string;
};

interface TokenFormProps {
  type: "buy" | "sell";
  onSubmit: SubmitHandler<FormValues>;
  submitting?: boolean;
  icon: React.ReactElement;
  ticker: string;
  fiatAmountFromTokenAmount: (amount: number) => number;
  tokenAmountFromFiatAmount: (amount: number) => number;
}

export const TokenForm = ({
  type,
  onSubmit,
  submitting = false,
  icon,
  ticker,
  fiatAmountFromTokenAmount,
  tokenAmountFromFiatAmount,
}: TokenFormProps) => {
  const { connected, awaitingApproval } = useWallet();
  const { register, handleSubmit, setValue, reset, watch } =
    useForm<FormValues>();

  const inputClasses =
    "p-0 bg-transparent border-transparent focus:shadow-none focus:border-transparent";

  const handleOnFiatChange = ({
    target: { value },
  }: {
    target: { value: string };
  }) => {
    setValue("fiatAmount", value);
    setValue("tokenAmount", tokenAmountFromFiatAmount(+value).toFixed(2));
  };

  const handleOnTokenChange = ({
    target: { value },
  }: {
    target: { value: string };
  }) => {
    setValue("tokenAmount", value);
    setValue("fiatAmount", fiatAmountFromTokenAmount(+value).toFixed(2));
  };

  const handleOnSubmit = async (values: FormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <Flex
        justifyContent="space-between"
        padding={4}
        marginTop={1}
        bgColor="gray.100"
        rounded="lg"
        _hover={{ bgColor: "gray.200", cursor: "pointer" }}
      >
        <Flex alignItems="center" justifyContent="center">
          {icon}
          <Flex alignItems="center" fontSize="sm" paddingLeft={2}>
            {ticker}
          </Flex>
        </Flex>
        <Flex flexDir="column" alignItems="end">
          <Flex fontSize="xl">
            <Input
              required
              variant="unstyled"
              textAlign="right"
              fontSize="xl"
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              pr="1px"
              {...register("fiatAmount")}
              onChange={handleOnFiatChange}
            />
            <span className="mt-px">$</span>
          </Flex>
          <Flex fontSize="sm" w="full">
            <Input
              required
              variant="unstyled"
              textAlign="right"
              fontSize="sm"
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              pr="1px"
              {...register("tokenAmount")}
              onChange={handleOnTokenChange}
            />
            <span className="mt-px">{ticker}</span>
          </Flex>
        </Flex>
      </Flex>
      {connected && (
        <Flex marginTop={4}>
          <Button
            w="full"
            type="submit"
            colorScheme="indigo"
            size="lg"
            isLoading={awaitingApproval || submitting}
            loadingText={
              awaitingApproval
                ? "Awaiting Approval"
                : type === "sell"
                ? "Selling"
                : "Buying"
            }
          >
            {type === "sell" ? "Sell" : "Buy"}
          </Button>
        </Flex>
      )}
    </form>
  );
};
