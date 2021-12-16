import { NATIVE_MINT } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, TokenBalance, TransactionSignature } from "@solana/web3.js";
import { useTokenBonding } from "@strata-foundation/react";
import { truthy } from "@strata-foundation/react/dist/lib/utils";
import { ITokenBonding, SplTokenBonding } from "@strata-foundation/spl-token-bonding";
import React, { createContext } from "react";
import { useAsync } from "react-async-hook";

const MAX_TXNS = 200;
export interface ITokenBondingTransactions {
  loading: boolean;
  error?: Error;
  transactions?: { baseAmount: number; targetAmount: number; }[];
  hasMore: boolean; // Does not fetch more than 200 txns. This boolean is true if there's more
}
export const TokenBondingRecentTransactions = createContext<ITokenBondingTransactions>({
  loading: false,
  hasMore: false
});

function sanitizeSolMint(mint: PublicKey): PublicKey {
  if (mint.equals(NATIVE_MINT)) {
    return SplTokenBonding.WRAPPED_SOL_MINT;
  }

  return mint;
}

/**
 * Gets the last 24h of bonding transactions
 * @param connection
 * @param tokenBonding 
 * @returns 
 */
async function getRecentBondingTransactions(connection: Connection, tokenBonding: ITokenBonding | undefined | null): Promise<{ baseAmount: number; targetAmount: number }[]> {
  if (!tokenBonding) {
    return [];
  }
  const sigs = await connection.getSignaturesForAddress(tokenBonding.publicKey, {
    limit: MAX_TXNS
  });
  const filtered = sigs.filter(sig => sig.blockTime && sig.blockTime >= ((new Date().valueOf() / 1000) - (60 * 60 * 24)));
  const transactions = await Promise.all(filtered.map(f => connection.getConfirmedTransaction(f.signature)));
  return transactions.filter(truthy).map(txn => {
    const serialized = txn.transaction.compileMessage();
    const baseStorageIndex = serialized.accountKeys.findIndex(i => i.equals(tokenBonding.baseStorage));

    if (txn.meta) {
      function sum(acc: number, balance: TokenBalance): number {
        return acc + (balance.uiTokenAmount.uiAmount || 0);
      }

      const preTargetBalances = txn.meta.preTokenBalances?.filter(b => b.mint == tokenBonding.targetMint.toBase58()).reduce(sum, 0) || 0;
      const postTargetBalances = txn.meta.postTokenBalances?.filter(b => b.mint == tokenBonding.targetMint.toBase58()).reduce(sum, 0) || 0;

      const preBaseBalance = txn.meta.preTokenBalances?.find(t => t.accountIndex === baseStorageIndex)?.uiTokenAmount.uiAmount || 0
      const postBaseBalance = txn.meta.postTokenBalances?.find(t => t.accountIndex === baseStorageIndex)?.uiTokenAmount.uiAmount || 0

      return {
        baseAmount: preBaseBalance - postBaseBalance,
        targetAmount: postTargetBalances - preTargetBalances
      }
    }
  }).filter(truthy)
}

export const TokenBondingRecentTransactionsProvider = ({ children, tokenBonding }: { children: React.ReactNode, tokenBonding: PublicKey | undefined | null }) => {
  const { connection } = useConnection();
  const { info: tokenBondingAcct } = useTokenBonding(tokenBonding);
  const { loading, error, result } = useAsync(getRecentBondingTransactions, [connection, tokenBondingAcct]);
  return <TokenBondingRecentTransactions.Provider
    value={{
      loading,
      error,
      transactions: result,
      hasMore: result?.length === MAX_TXNS
    }}
  >
    { children }
  </TokenBondingRecentTransactions.Provider>
}

export const useTokenBondingRecentTransactions = (): ITokenBondingTransactions => {
  return React.useContext(TokenBondingRecentTransactions)
}
