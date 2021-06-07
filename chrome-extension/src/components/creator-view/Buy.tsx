import React, { useState } from "react"
import { Alert, Button, Form, InputNumber } from "antd"
import { buy } from "../../utils/action"
import { WumboCreator, WumboInstance } from "../../wumbo-api/state"
import { useAsyncCallback } from "react-async-hook"
import { useConnection } from "@oyster/common/lib/contexts/connection"
import { useAssociatedAccount } from "../../utils/walletState"
import { useWallet } from "../../utils/wallet"
import Swap from "./Swap"
import { CreatorInfo, CreatorInfoState } from "../../utils/creatorState"
import { inverseLogCurve, logCurve, usePricing } from "../../utils/pricing"
import { useMint } from "@oyster/common/lib/contexts/accounts"

interface BuyProps {
  creatorInfo: CreatorInfo
  setShowWalletConnect: any
}

export default ({ creatorInfo, setShowWalletConnect }: BuyProps) => {
  const connection = useConnection()
  const { curve, inverseCurve, loading } = usePricing(
    creatorInfo.tokenBonding.publicKey
  )
  const { wallet, awaitingApproval } = useWallet()
  const doBuy = async (baseAmount: number, targetAmount: number) => {
    await buy(wallet)(
      connection,
      creatorInfo.tokenBonding.publicKey,
      targetAmount
    )
  }
  const { execute } = useAsyncCallback(doBuy)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Swap
      setShowWalletConnect={setShowWalletConnect}
      base={{
        key: creatorInfo.tokenBonding.baseMint,
        name: "WUM",
        price: curve,
      }}
      target={{
        key: creatorInfo.tokenBonding.targetMint,
        name: "NXX2",
        price: inverseCurve,
      }}
      swap={execute}
    />
  )
}
