import React from "react";
import { ConnectionProvider } from "@oyster/common/lib/contexts/connection";
import TweetDecorations from "./TweetDecorations";
import "antd/dist/antd.css";
import { UsdWumboPriceProvider } from "../utils/pricing";
import { AccountsProvider } from "@oyster/common/lib/contexts/accounts";
import { WalletProvider } from "../utils/wallet";

import "../index.css";

export default () => {
  return (
    <ConnectionProvider>
      <AccountsProvider>
        <WalletProvider>
          <UsdWumboPriceProvider>
            <TweetDecorations />
          </UsdWumboPriceProvider>
        </WalletProvider>
      </AccountsProvider>
    </ConnectionProvider>
  );
};
