import { Market } from "@project-serum/serum";
import { Connection, PublicKey } from "@solana/web3.js";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  SERUM_PROGRAM_ID,
  SOL_TOKEN,
  SOL_TO_USD_MARKET,
  WUM_BONDING,
  WUM_REWARDS_PERCENTAGE,
  WUM_TOKEN,
} from "../constants/globals";
import { Order } from "@project-serum/serum/lib/market";
import { LogCurveV0, TokenBondingV0 } from "spl-token-bonding";
import { MintInfo, u64 } from "@solana/spl-token";
// @ts-ignore
import { gsl_sf_lambert_W0 } from "./lambertw";
import { useAccount } from "./account";
import { useMint } from "./mintState";
import { useAssociatedAccount } from "./walletState";
import { useWallet } from "./wallet";
import { useConnection } from "@oyster/common";
import { useAsync } from "react-async-hook";
import { useTokenRef } from "./tokenRef";

// TODO: Use actual connection. But this can't happen in dev
let connection = new Connection("https://api.mainnet-beta.solana.com");

const UsdWumboPriceContext = React.createContext<number | undefined>(undefined);

function generalLogCurve(c: number, g: number, x: number): number {
  return c * ((1 / g + x) * Math.log(1 + g * x) - x);
}
/// Integral of c * log(1 + g * x) dx from a to b
/// https://www.wolframalpha.com/input/?i=c+*+log%281+%2B+g+*+x%29+dx
function logCurveRange(c: number, g: number, a: number, b: number): number {
  return generalLogCurve(c, g, b) - generalLogCurve(c, g, a);
}

export function supplyAsNum(mint: MintInfo): number {
  return amountAsNum(mint.supply, mint);
}

export function amountAsNum(amount: u64, mint: MintInfo): number {
  const decimals = new u64(Math.pow(10, mint.decimals).toString());
  const decimal = amount.mod(decimals).toNumber() / decimals.toNumber();
  return amount.div(decimals).toNumber() + decimal;
}

export function useRentExemptAmount(
  size: number
): {
  loading: boolean;
  amount: number | undefined;
  error: Error | undefined;
} {
  const connection = useConnection();
  const {
    loading,
    error,
    result,
  } = useAsync(connection.getMinimumBalanceForRentExemption, [size]);

  const amount = useMemo(() => (result || 0) / Math.pow(10, 9), [result]);

  return {
    amount,
    error,
    loading,
  };
}

export function useSolOwnedAmount(): { amount: number; loading: boolean } {
  const { wallet } = useWallet();
  const { info: lamports, loading } = useAccount<number>(
    wallet?.publicKey || undefined,
    (_, account) => account.lamports
  );
  const result = React.useMemo(() => (lamports || 0) / Math.pow(10, 9), [
    lamports,
  ]);

  return {
    amount: result,
    loading,
  };
}

export function useOwnedAmountForOwnerAndHandle(
  owner: PublicKey | undefined,
  handle: string | undefined
): { amount: number | undefined; loading: boolean } {
  const [state, setState] = useState<{
    amount: number | undefined;
    loading: boolean;
  }>({
    loading: true,
    amount: 0,
  });
  const { info: tokenRef, loading: loadingRef } = useTokenRef(handle);
  const { info: token, loading: loadingAmount } = useAccount(
    tokenRef?.tokenBonding,
    TokenBondingV0.fromAccount
  );
  const {
    associatedAccount,
    loading: loadingAssociatedAccount,
  } = useAssociatedAccount(owner, token?.targetMint);
  const mint = useMint(token?.targetMint);

  useEffect(() => {
    if (tokenRef && token && associatedAccount && mint) {
      setState({
        loading: false,
        amount: amountAsNum(associatedAccount.amount, mint),
      });
    } else if (!loadingRef && !loadingAmount && !loadingAssociatedAccount) {
      setState({
        loading: false,
        amount: undefined,
      });
    }
  }, [
    tokenRef,
    token,
    associatedAccount,
    mint,
    loadingRef,
    loadingAmount,
    loadingAssociatedAccount,
  ]);

  return state;
}

export function useOwnedAmount(
  token: PublicKey | undefined
): number | undefined {
  const { wallet } = useWallet();
  const { associatedAccount } = useAssociatedAccount(wallet?.publicKey, token);
  const mint = useMint(token);
  const [amount, setAmount] = useState<number>();

  useEffect(() => {
    if (mint && associatedAccount) {
      setAmount(amountAsNum(associatedAccount.amount, mint));
    }
  }, [associatedAccount, mint]);

  return Number(amount);
}

// baseAmount = curve(supply + ret) * founder_rewards_percent
// baseAmount / founder_rewards_percent = curve(supply + ret)
/*
  Just accept the magic...

  This might help if you can't
  https://www.wolframalpha.com/input/?i=solve%5Bc*%281%2Fg+%2B+%28s+%2B+x%29%29+*+log%28g+*+%28s+%2B+x%29+%2B+1%29+-+c+*+%28s+%2B+x%29+%3D+k%2C+x%5D
*/
export const inverseLogCurve = (
  curve: LogCurveV0,
  base: MintInfo,
  target: MintInfo,
  founderRewardsPercentage: number
) => (baseAmount: number): number => {
  const c = curve.c;
  const gNonBaseRel = curve.g;
  const g = curve.isBaseRelative
    ? gNonBaseRel / (1.0 + supplyAsNum(base))
    : gNonBaseRel;
  const s = supplyAsNum(target);
  const rewardsDecimal = founderRewardsPercentage / 10000;
  const k = baseAmount + generalLogCurve(c, g, s);
  const exp = gsl_sf_lambert_W0((g * k - c) / (c * Math.E)) + 1;

  return Math.abs(
    (Math.pow(Math.E, exp) - g * s - 1) / ((1 + rewardsDecimal) * g)
  );
};

const startFinishLogCurve = (curve: LogCurveV0, base: MintInfo) => (
  start: number,
  finish: number
) => {
  const c = curve.c;
  const gNonBaseRel = curve.g;
  const g = curve.isBaseRelative
    ? gNonBaseRel / (1.0 + supplyAsNum(base))
    : gNonBaseRel;

  return logCurveRange(c, g, start, finish);
};

export const logCurve = (
  curve: LogCurveV0,
  base: MintInfo,
  target: MintInfo,
  founderRewardsPercentage: number
) => (targetAmount: number): number => {
  const rewardsDecimal = founderRewardsPercentage / 10000;
  return startFinishLogCurve(curve, base)(
    supplyAsNum(target),
    supplyAsNum(target) + targetAmount * (1 + rewardsDecimal)
  );
};

export interface PricingState {
  loading: boolean;
  // How much to buy this much of the target coin in terms of base
  targetToBasePrice(targetAmount: number): number;
  // What is the target price in terms of base if there are no founder rewards collected (sell)
  sellTargetToBasePrice(targetAmount: number): number;
  // How many target coins we'll get for this base amount
  baseToTargetPrice(baseAmount: number): number;
  sellBaseToTargetPrice(baseAmount: number): number;
  // General from some start supply to finish supply
  targetRangeToBasePrice(start: number, finish: number): number;
  // The current price of target in terms of base
  current: number;
}
export function useBondingPricing(
  tokenBonding: PublicKey | undefined
): PricingState {
  const [state, setState] = useState<PricingState>({
    loading: true,
    targetToBasePrice: () => 0,
    sellTargetToBasePrice: () => 0,
    baseToTargetPrice: () => 0,
    sellBaseToTargetPrice: () => 0,
    targetRangeToBasePrice: () => 0,
    current: 0,
  });
  const { info: bonding } = useAccount(
    tokenBonding,
    TokenBondingV0.fromAccount
  );
  const { info: curve } = useAccount(bonding?.curve, LogCurveV0.fromAccount);

  const base = useMint(bonding?.baseMint);
  const target = useMint(bonding?.targetMint);
  useEffect(() => {
    if (curve && base && target && bonding) {
      const targetRangeToBasePrice = startFinishLogCurve(curve, base);
      setState({
        loading: false,
        targetToBasePrice: logCurve(
          curve,
          base,
          target,
          bonding.founderRewardPercentage
        ),
        sellTargetToBasePrice: (amount: number) =>
          targetRangeToBasePrice(
            supplyAsNum(target) - amount,
            supplyAsNum(target)
          ),
        baseToTargetPrice: inverseLogCurve(
          curve,
          base,
          target,
          bonding.founderRewardPercentage
        ),
        sellBaseToTargetPrice: (amount: number) =>
          inverseLogCurve(curve, base, target, 0)(-amount),
        targetRangeToBasePrice,
        current:
          curve.c *
          Math.log(
            1 +
              (curve.g * supplyAsNum(target)) /
                (curve.isBaseRelative ? supplyAsNum(base) : 1)
          ),
      });
    }
  }, [curve, base, target, bonding]);

  return state;
}

export const UsdWumboPriceProvider = ({ children = undefined as any }) => {
  const price = useMarketPrice(SOL_TO_USD_MARKET);
  const { current } = useBondingPricing(WUM_BONDING);

  return (
    <UsdWumboPriceContext.Provider value={(price || 0) * current}>
      {children}
    </UsdWumboPriceContext.Provider>
  );
};

export const useWumboUsdPrice = () => {
  return useContext(UsdWumboPriceContext);
};

export const useMarketPrice = (
  marketAddress: PublicKey
): number | undefined => {
  const [price, setPrice] = useState<number>();
  useEffect(() => {
    const fetch = async () => {
      try {
        let market = await Market.load(
          connection,
          marketAddress,
          undefined,
          SERUM_PROGRAM_ID
        );
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
  const solPrice = useMarketPrice(SOL_TO_USD_MARKET);

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
