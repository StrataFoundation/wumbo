import React from "react";
import {ConnectionProvider} from "@oyster/common/lib/contexts/connection";
import TweetDecorations from "./TweetDecorations";
import "antd/dist/antd.css";
import {UsdSolcloutPriceProvider} from "../utils/pricing";

import "../index.css";
import {WalletProvider} from "../utils/wallet";

export default () => {
  return (
    <ConnectionProvider>
      <WalletProvider>
        <UsdSolcloutPriceProvider>
          <TweetDecorations />
        </UsdSolcloutPriceProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
