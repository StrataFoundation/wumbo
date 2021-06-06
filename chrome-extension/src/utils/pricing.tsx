import { Market } from "@project-serum/serum";
import { Connection, PublicKey } from "@solana/web3.js";
import React, { useContext, useEffect, useState } from "react";
import {
  SERUM_PROGRAM_ID,
  SOL_TO_USD_MARKET,
  WUM_BONDING,
  WUM_REWARDS_PERCENTAGE,
} from "../constants/globals";
import { Order } from "@project-serum/serum/lib/market";
import { LogCurveV0, TokenBondingV0 } from "../spl-token-bonding-api/state";
import { MintInfo, u64 } from "@solana/spl-token";
// @ts-ignore
import { gsl_sf_lambert_Wm1 } from "./lambertw";
import { useAccount } from "./account";
import { useMint } from "./mintState";

// TODO: Use actual connection. But this can't happen in dev
let connection = new Connection("https://api.mainnet-beta.solana.com");

const UsdWumboPriceContext = React.createContext<number | undefined>(undefined);

function generalLogCurve(c: number, g: number, base: number, x: number): number {
  return (base * x) + c * ((1 / g + x) * Math.log(1 + g * x) - x);
}
/// Integral of base + c * log(1 + g * x) dx from a to b 
/// https://www.wolframalpha.com/input/?i=c+*+log%281+%2B+g+*+x%29+dx
function logCurveRange(c: number, g: number, base: number, a: number, b: number): number {
  return generalLogCurve(c, g, base, b) - generalLogCurve(c, g, base, a);
}

function supplyAsNum(mint: MintInfo): number {
  return mint.supply
    .div(new u64(Math.pow(10, mint.decimals).toString()))
    .toNumber();
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
  const rewardsDecimal =
    founderRewardsPercentage == 0 ? 1 : founderRewardsPercentage / 10000;
  const k = (baseAmount / rewardsDecimal + generalLogCurve(c, g, curve.base, s) - (curve.base * s)) / (1 + curve.base);
  const exp = gsl_sf_lambert_Wm1((g * k - c) / (c * Math.E)) + 1;

  return Math.abs((Math.pow(Math.E, exp) - g * s - 1) / g);
};

export const logCurve = (
  curve: LogCurveV0,
  base: MintInfo,
  target: MintInfo,
  founderRewardsPercentage: number
) => (targetAmount: number): number => {
  const c = curve.c;
  const gNonBaseRel = curve.g;
  const g = curve.isBaseRelative
    ? gNonBaseRel / (1.0 + supplyAsNum(base))
    : gNonBaseRel;
  const rewardsDecimal =
    founderRewardsPercentage == 0 ? 1 : founderRewardsPercentage / 10000;

  return (
    logCurveRange(
      c,
      g,
      curve.base,
      supplyAsNum(target),
      supplyAsNum(target) + targetAmount
    ) * rewardsDecimal
  );
};

export const UsdWumboPriceProvider = ({ children = undefined as any }) => {
  const price = useMarketPrice(SOL_TO_USD_MARKET);
  const { info: bonding } = useAccount(WUM_BONDING, TokenBondingV0.fromAccount);
  const { info: curve } = useAccount(bonding?.curve, LogCurveV0.fromAccount);
  const base = useMint(bonding?.baseMint);
  const target = useMint(bonding?.targetMint);
  const curveImpl =
    curve && base && target
      ? logCurve(curve, base, target, WUM_REWARDS_PERCENTAGE)
      : () => null;
  return (
    <UsdWumboPriceContext.Provider value={curveImpl(1) || 0}>
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
