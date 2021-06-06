import React, { useState } from "react";
import { Alert, Button, Form, InputNumber } from "antd";
import { buy } from "../../utils/action";
import { WumboCreator, WumboInstance } from "../../wumbo-api/state";
import { useAsyncCallback } from "react-async-hook";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { useAssociatedAccount } from "../../utils/walletState";
import { useWallet } from "../../utils/wallet";
import Swap from "./Swap";
import { useMint } from "../../utils/mintState";
import { CreatorInfo, CreatorInfoState } from "../../utils/creatorState";
import { inverseLogCurve, logCurve } from "../../utils/pricing";
import {
  SOL_TOKEN,
  WUM_BONDING,
  WUM_REWARDS_PERCENTAGE,
  WUM_TOKEN,
} from "../../constants/globals";
import { useAccount } from "../../utils/account";
import { LogCurveV0, TokenBondingV0 } from "../../spl-token-bonding-api/state";

export default () => {
  const connection = useConnection();
  const baseMint = useMint(SOL_TOKEN);
  const targetMint = useMint(WUM_TOKEN);
  const { info: tokenBonding } = useAccount(
    WUM_BONDING,
    TokenBondingV0.fromAccount
  );
  const { info: curve } = useAccount(
    tokenBonding?.curve,
    LogCurveV0.fromAccount
  );
  const { wallet, awaitingApproval } = useWallet();
  const doBuy = async (baseAmount: number, targetAmount: number) => {
    await buy(wallet)(connection, WUM_BONDING, targetAmount);
  };
  const { execute, loading, error } = useAsyncCallback(doBuy);

  if (!curve || !baseMint || !targetMint) {
    return <div>Loading...</div>;
  }

  return (
    <Swap
      base={{
        key: SOL_TOKEN,
        name: "SOL",
        price: logCurve(curve, baseMint, targetMint, WUM_REWARDS_PERCENTAGE),
      }}
      target={{
        key: WUM_TOKEN,
        name: "NXX2",
        price: inverseLogCurve(
          curve,
          baseMint,
          targetMint,
          WUM_REWARDS_PERCENTAGE
        ),
      }}
      swap={execute}
    />
  );
};
