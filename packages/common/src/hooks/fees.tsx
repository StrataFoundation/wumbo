import { Connection } from "@solana/web3.js";
import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { useConnection } from "../contexts";

async function getFeesPerSignature(
  connection: Connection
): Promise<number | undefined> {
  const feeCalculator = await connection.getFeeCalculatorForBlockhash(
    (
      await connection.getRecentBlockhash()
    ).blockhash
  );

  return feeCalculator.value?.lamportsPerSignature;
}

export function useFees(signatures: number): {
  loading: boolean;
  amount: number | undefined;
  error: Error | undefined;
} {
  const connection = useConnection();
  const { loading, error, result } = useAsync(getFeesPerSignature, [
    connection,
  ]);

  const amount = useMemo(
    () => ((result || 0) * signatures) / Math.pow(10, 9),
    [result, signatures]
  );

  return {
    amount,
    error,
    loading,
  };
}

export function useRentExemptAmount(size: number): {
  loading: boolean;
  amount: number | undefined;
  error: Error | undefined;
} {
  const connection = useConnection();
  const { loading, error, result } = useAsync(
    connection.getMinimumBalanceForRentExemption.bind(connection),
    [size]
  );

  const amount = useMemo(() => (result || 0) / Math.pow(10, 9), [result]);

  return {
    amount,
    error,
    loading,
  };
}

export function useEstimatedFees(
  size: number,
  signatures: number
): {
  loading: boolean;
  amount: number | undefined;
  error: Error | undefined;
} {
  const { loading, error, amount: fees } = useFees(signatures);
  const {
    loading: rentLoading,
    error: rentError,
    amount: rent,
  } = useRentExemptAmount(size);

  return {
    amount: fees && rent ? fees + rent : undefined,
    error: error || rentError,
    loading: loading || rentLoading,
  };
}
