import { Box, Center, HStack, Icon, Text } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import {
  amountAsNum,
  Spinner,
  supplyAsNum,
  useBondingPricing,
  useErrorHandler,
  useMint,
  useTokenAccount,
  useTokenBonding,
} from "@strata-foundation/react";
import React from "react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { useTokenBondingRecentTransactions } from "./contexts";

export const PriceChangeTicker = ({
  tokenBonding,
}: {
  tokenBonding: PublicKey;
}) => {
  const { transactions, loading, error, hasMore } =
    useTokenBondingRecentTransactions();
  const {
    pricing,
    loading: loadingPricing,
    error: pricingError,
  } = useBondingPricing(tokenBonding);
  const { info: tokenBondingAcc, loading: loadingBonding } =
    useTokenBonding(tokenBonding);
  const { info: baseStorage } = useTokenAccount(tokenBondingAcc?.baseStorage);
  const baseMint = useMint(tokenBondingAcc?.baseMint);
  const targetMint = useMint(tokenBondingAcc?.targetMint);

  const { handleErrors } = useErrorHandler();
  handleErrors(error, pricingError);

  if (
    loading ||
    loadingPricing ||
    hasMore ||
    loadingBonding ||
    !baseMint ||
    !baseStorage
  ) {
    return (
      <Box>
        <Spinner size="xs" />
      </Box>
    );
  }

  const totalTargetMintChange = (transactions || []).reduce((acc, txn) => {
    return acc + txn.targetAmount;
  }, 0);
  const totalBaseMintChange = (transactions || []).reduce((acc, txn) => {
    return acc + txn.baseAmount;
  }, 0);

  const pricingCurve = pricing!.hierarchy!.pricingCurve;
  const R = amountAsNum(baseStorage.amount, baseMint);
  const S = supplyAsNum(targetMint);
  const prevPrice = pricingCurve.current();
  const currentPrice = pricingCurve.current(
    R - totalBaseMintChange,
    S - totalTargetMintChange
  );

  return (
    <HStack
      spacing={0}
      alignItems="center"
      color={currentPrice < prevPrice ? "red.600" : "green.600"}
    >
      {currentPrice < prevPrice ? (
        <Icon as={AiFillCaretDown} />
      ) : (
        <Icon as={AiFillCaretUp} />
      )}
      <Text fontSize="sm">
        {(Math.abs((prevPrice - currentPrice) / prevPrice) * 100).toFixed(1)}%
      </Text>
    </HStack>
  );
};
