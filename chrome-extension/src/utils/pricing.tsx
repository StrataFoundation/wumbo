import { Market } from "@project-serum/serum";
import { Connection, PublicKey } from "@solana/web3.js";
import React, { useContext, useEffect, useState } from "react";
import { SERUM_PROGRAM_ID, WUMBO_TO_USD_MARKET } from "../constants/globals";
import { Order } from "@project-serum/serum/lib/market";

// TODO: Use actual connection. But this can't happen in dev
let connection = new Connection("https://api.mainnet-beta.solana.com");

const UsdWumboPriceContext = React.createContext<number | undefined>(undefined);

export const UsdWumboPriceProvider = ({ children = undefined as any }) => {
  const price = useMarketPrice(WUMBO_TO_USD_MARKET);
  return (
    <UsdWumboPriceContext.Provider value={price}>
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
