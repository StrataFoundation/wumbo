import React, { useState } from "react";
import { Alert, Button, Form, InputNumber } from "antd";
import { buy } from "../../utils/action";
import { WumboCreator, WumboInstance } from "../../wumbo-api/state";
import { useAsyncCallback } from "react-async-hook";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { useAssociatedAccount } from "../../utils/walletState";
import { useWallet } from "../../utils/wallet";
import Swap from "./Swap";
import { CreatorInfo, CreatorInfoState } from "../../utils/creatorState";
import { inverseLogCurve, logCurve } from "../../utils/pricing";
import { useMint } from "@oyster/common/lib/contexts/accounts";

interface BuyProps {
  creatorInfo: CreatorInfo;
}

export default ({ creatorInfo }: BuyProps) => {
  const connection = useConnection();
  const baseMint = useMint(creatorInfo.tokenBonding.baseMint);
  const targetMint = useMint(creatorInfo.tokenBonding.targetMint);
  const { wallet, awaitingApproval } = useWallet();
  const doBuy = async (baseAmount: number, targetAmount: number) => {
    await buy(wallet)(
      connection,
      creatorInfo.tokenBonding.publicKey,
      targetAmount
    );
  };
  const { execute } = useAsyncCallback(doBuy);

  if (!baseMint || !targetMint) {
    return <div>Loading...</div>;
  }

  return (
    <Swap
      base={{
        key: creatorInfo.tokenBonding.baseMint,
        name: "WUM",
        price: logCurve(
          creatorInfo.curve,
          baseMint,
          targetMint,
          creatorInfo.tokenBonding.founderRewardPercentage
        ),
      }}
      target={{
        key: creatorInfo.tokenBonding.targetMint,
        name: "NXX2",
        price: inverseLogCurve(
          creatorInfo.curve,
          baseMint,
          targetMint,
          creatorInfo.tokenBonding.founderRewardPercentage
        ),
      }}
      swap={execute}
    />
  );
};
