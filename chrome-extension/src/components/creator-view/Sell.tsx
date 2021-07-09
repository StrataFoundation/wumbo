import React, { useState } from "react"
import { Alert, Button, Form, InputNumber } from "antd"
import { sell } from "../../utils/action"
import { WumboCreator, WumboInstance } from "../../wumbo-api/state"
import { useAsyncCallback } from "react-async-hook"
import { useConnection } from "@oyster/common/lib/contexts/connection"
import { useAssociatedAccount } from "../../utils/walletState"
import { useWallet } from "../../utils/wallet"
import Swap from "./Swap"
import { CreatorInfo, CreatorInfoState } from "../../utils/creatorState"
import { useMint } from "@oyster/common/lib/contexts/accounts"
import { inverseLogCurve, logCurve, usePricing } from "../../utils/pricing"
import { BASE_SLIPPAGE } from "../../constants/globals"

interface SellProps {
  creatorInfo: CreatorInfo
  setShowWalletConnect: any
  setSwapped: any
}

export default ({
  creatorInfo,
  setShowWalletConnect,
  setSwapped,
}: SellProps) => {
  const connection = useConnection()
  const { curve, inverseCurve, loading } = usePricing(
    creatorInfo.tokenBonding.publicKey
  )
  const { wallet } = useWallet()
  const doSell = async (baseAmount: number, targetAmount: number) => {
    await sell(wallet)(
      connection,
      creatorInfo.tokenBonding.publicKey,
      targetAmount,
      baseAmount - BASE_SLIPPAGE * baseAmount
    )
  }
  const { execute } = useAsyncCallback(doSell)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Swap
      setSwapped={setSwapped}
      setShowWalletConnect={setShowWalletConnect}
      base={{
        key: creatorInfo.tokenBonding.targetMint,
        name: "NXX2",
        price: curve,
      }}
      target={{
        key: creatorInfo.tokenBonding.baseMint,
        name: "WUM",
        price: inverseCurve,
      }}
      swap={execute}
    />
  )
}