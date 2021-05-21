import {Market} from "@project-serum/serum";
import {Connection, PublicKey} from "@solana/web3.js";
import React, {useContext, useEffect, useState} from "react";
import {SERUM_PROGRAM_ID, SOLCLOUT_TO_USD_MARKET} from "../constants/globals";
import {Order} from "@project-serum/serum/lib/market";

// TODO: Use actual connection. But this can't happen in dev
let connection = new Connection("https://api.mainnet-beta.solana.com");

const UsdSolcloutPriceContext = React.createContext<number | undefined>(
  undefined
);

export const UsdSolcloutPriceProvider = ({ children = undefined as any }) => {
  const price = useMarketPrice(SOLCLOUT_TO_USD_MARKET);
  return (
    <UsdSolcloutPriceContext.Provider value={price}>
      {children}
    </UsdSolcloutPriceContext.Provider>
  );
};

export const useSolcloutUsdPrice = () => {
  return useContext(UsdSolcloutPriceContext);
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
