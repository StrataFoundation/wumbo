import React, { useState } from "react";
import { Alert, Button, Form, InputNumber } from "antd";
import { sell } from "../../utils/action";
import { WumboCreator, WumboInstance } from "../../wumbo-api/state";
import { useAsyncCallback } from "react-async-hook";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { useAssociatedAccount } from "../../utils/walletState";
import { useWallet } from "../../utils/wallet";
import Swap from "./Swap";
import { CreatorInfo, CreatorInfoState } from "../../utils/creatorState";
import { inverseLogCurve, logCurve } from "../../utils/pricing";
import { useMint } from "@oyster/common/lib/contexts/accounts";

interface SellProps {
  creatorInfo: CreatorInfo;
}

export default ({ creatorInfo }: SellProps) => {
  const connection = useConnection();
  const baseMint = useMint(creatorInfo.tokenBonding.baseMint)
  const targetMint = useMint(creatorInfo.tokenBonding.targetMint)
  const { wallet } = useWallet();
  const doSell = async (baseAmount: number, targetAmount: number) => {
    await sell(wallet)(
      connection,
      creatorInfo.tokenBonding.publicKey,
      targetAmount
    )
  }
  const { execute } = useAsyncCallback(doSell);

  if (!baseMint || !targetMint) {
    return <div>Loading...</div>
  }

  return <Swap
    base={{
      key: creatorInfo.tokenBonding.targetMint,
      name: "NXX2",
      price: inverseLogCurve(
        creatorInfo.curve, 
        baseMint,
        targetMint, 
        creatorInfo.tokenBonding.founderRewardPercentage
      )
    }}
    target={{
      key: creatorInfo.tokenBonding.baseMint,
      name: 'WUM',
      price: logCurve(
        creatorInfo.curve, 
        baseMint,
        targetMint, 
        creatorInfo.tokenBonding.founderRewardPercentage
      )
    }}
    swap={execute}
  />
};
