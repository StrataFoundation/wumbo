import { Market } from "@project-serum/serum";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { useConnection } from "../contexts/connection";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  SERUM_PROGRAM_ID,
  SOL_TOKEN,
  SOL_TO_USD_MARKET,
  WUM_BONDING,
  WUM_TOKEN,
} from "../constants/globals";
import { Order } from "@project-serum/serum/lib/market";
import { MintInfo, u64 } from "@solana/spl-token";
// @ts-ignore
import { gsl_sf_lambert_W0 } from "./lambertw";
import { useAccount } from "./account";
import { useMint } from "./mintState";
import { useAssociatedAccount } from "./walletState";
import { useWallet } from "../contexts/walletContext";
import { TokenAccountParser } from "@oyster/common";
import { useAsync } from "react-async-hook";
import { useTwitterTokenRef } from "./tokenRef";
import { Curve as DeserializeCurve, TokenBonding } from "./deserializers/spl-token-bonding";
import { Curve, fromCurve } from "@wum.bo/spl-token-bonding";
import { useQuery, gql } from '@apollo/client';

// TODO: Use actual connection. But this can't happen in dev
let connection = new Connection("https://api.mainnet-beta.solana.com");

const UsdWumboPriceContext = React.createContext<number | undefined>(undefined);

export function supplyAsNum(mint: MintInfo): number {
  return amountAsNum(mint.supply, mint);
}

export function amountAsNum(amount: u64, mint: MintInfo): number {
  const decimals = new u64(Math.pow(10, mint.decimals).toString());
  const decimal = amount.mod(decimals).toNumber() / decimals.toNumber();
  return amount.div(decimals).toNumber() + decimal;
}

export function useRentExemptAmount(size: number): {
  loading: boolean;
  amount: number | undefined;
  error: Error | undefined;
} {
  const connection = useConnection();
  const { loading, error, result } = useAsync(connection.getMinimumBalanceForRentExemption, [size]);

  const amount = useMemo(() => (result || 0) / Math.pow(10, 9), [result]);

  return {
    amount,
    error,
    loading,
  };
}

export function useSolOwnedAmount(): { amount: number; loading: boolean } {
  const { adapter } = useWallet();
  const { info: lamports, loading } = useAccount<number>(
    adapter?.publicKey || undefined,
    (_, account) => account.lamports
  );
  const result = React.useMemo(() => (lamports || 0) / Math.pow(10, 9), [lamports]);

  return {
    amount: result,
    loading,
  };
}

export function useOwnedAmountForOwnerAndHandle(
  owner: PublicKey | undefined,
  handle: string | undefined
): { amount: number | undefined; loading: boolean } {
  const { info: tokenRef, loading: loadingRef } = useTwitterTokenRef(handle);
  const amount = useUserOwnedAmount(owner, tokenRef?.mint);

  return {
    loading: loadingRef,
    amount
  }
}

export function useUserOwnedAmount(wallet: PublicKey | undefined, token: PublicKey | undefined): number | undefined {
  const { associatedAccount } = useAssociatedAccount(wallet, token);
  const mint = useMint(token);
  const [amount, setAmount] = useState<number>();

  useEffect(() => {
    if (mint && associatedAccount) {
      setAmount(amountAsNum(associatedAccount.amount, mint));
    }
  }, [associatedAccount, mint]);

  return amount && Number(amount);
}

export function useOwnedAmount(token: PublicKey | undefined): number | undefined {
  const { publicKey } = useWallet();
  return useUserOwnedAmount(publicKey || undefined, token);
}

export interface PricingState {
  loading: boolean;
  curve?: Curve
}
export function useBondingPricing(tokenBonding: PublicKey | undefined): PricingState {
  const { info: bonding, loading: bondingLoading  } = useAccount(tokenBonding, TokenBonding);
  const { info: curve, loading: curveLoading } = useAccount(bonding?.curve, DeserializeCurve, true);

  const base = useMint(bonding?.baseMint);
  const target = useMint(bonding?.targetMint);
  const pricing = useMemo(() => curve && base && target && fromCurve(curve, base, target), [curve, base, target])
  const loading = useMemo(() => curveLoading || bondingLoading, [curveLoading, bondingLoading]);
  
  return {
    curve: pricing,
    loading
  };
}


const GET_TOTAL_WUM_LOCKED = gql`
  query GetTotalWumLocked {
    totalWumLocked
  }
`;
export const UsdWumboPriceProvider = ({ children = undefined as any }) => {
  const solPrice = useMarketPrice(SOL_TO_USD_MARKET);

  // Normal wum price...
  // const { curve } = useBondingPricing(WUM_BONDING);
  // const wumPrice = (solPrice || 0) * (curve ? curve.current() : 0);

  // Beta wum price...
  const solMint = useMint(SOL_TOKEN);
  const { info: wumBonding } = useAccount(WUM_BONDING, TokenBonding);
  const { info: baseStorage } = useAccount(
    wumBonding?.baseStorage,
    (pubkey: PublicKey, acct: AccountInfo<Buffer>) => {
      return TokenAccountParser(pubkey, acct)!.info;
    }
  );
  const { data: { totalWumLocked } = {} } = useQuery<{ totalWumLocked: number | undefined }>(GET_TOTAL_WUM_LOCKED, {})
  const baseStorageAmount = baseStorage && solMint ? amountAsNum(baseStorage.amount, solMint) : 0
  const bwumPrice = (baseStorageAmount / (totalWumLocked || 1)) * (solPrice || 0)

  return (
    <UsdWumboPriceContext.Provider value={bwumPrice}>
      {children}
    </UsdWumboPriceContext.Provider>
  );
};

export const useWumboUsdPrice = () => {
  return useContext(UsdWumboPriceContext);
};

const SolPriceContext = React.createContext<number | undefined>(undefined);
export const useSolPrice = () => {
  return useContext(SolPriceContext)
}

export const SolPriceProvider: React.FC = ({ children }) => {
  const price = useMarketPrice(SOL_TO_USD_MARKET);
  return <SolPriceContext.Provider
    value={price}
    >
      { children }
    </SolPriceContext.Provider>
}

export const useMarketPrice = (marketAddress: PublicKey): number | undefined => {
  const [price, setPrice] = useState<number>();
  useEffect(() => {
    const fetch = async () => {
      try {
        let market = await Market.load(connection, marketAddress, undefined, SERUM_PROGRAM_ID);
        const book = await market.loadAsks(connection);
        const top = book.items(false).next().value as Order;
        setPrice(top.price);
      } catch (e) {
        console.error(e);
      }
    };

    fetch();

    const interval = setInterval(fetch, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return price;
};

export function useFiatPrice(token: PublicKey | undefined): number | undefined {
  const wumboPrice = useWumboUsdPrice();
  const solPrice = useSolPrice();
  
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    if (token?.toBase58() == SOL_TOKEN.toBase58()) {
      setPrice(solPrice);
    } else if (token?.toBase58() == WUM_TOKEN.toBase58()) {
      setPrice(wumboPrice);
    }
  }, [token, wumboPrice, solPrice]);

  return price;
}
