import React, { useState } from "react"
import { Alert, Button, Form, InputNumber } from "antd"
import { sell } from "../../utils/action"
import { WumboCreator, WumboInstance } from "../../wumbo-api/state"
import { useAsyncCallback } from "react-async-hook"
import { useConnection } from "@oyster/common/lib/contexts/connection"
import { useAssociatedAccount } from "../../utils/walletState"
import { useWallet } from "../../utils/wallet"
import Swap from "./Swap"
import { useMint } from "../../utils/mintState"
import { CreatorInfo, CreatorInfoState } from "../../utils/creatorState"
import { usePricing } from "../../utils/pricing"
import {
  BASE_SLIPPAGE,
  SOL_TOKEN,
  WUM_BONDING,
  WUM_REWARDS_PERCENTAGE,
  WUM_TOKEN,
} from "../../constants/globals"
import { useAccount } from "../../utils/account"
import { LogCurveV0, TokenBondingV0 } from "../../spl-token-bonding-api/state"

interface Props {
  setShowWalletConnect: any
  setSwapped: any
}

export default (props: Props) => {
  const connection = useConnection()
  const { curve, inverseCurve, loading } = usePricing(WUM_BONDING)
  const { wallet, awaitingApproval } = useWallet()
  const doSell = async (baseAmount: number, targetAmount: number) => {
    await sell(wallet)(
      connection,
      WUM_BONDING,
      targetAmount,
      baseAmount - BASE_SLIPPAGE * baseAmount
    )
  }
  const { execute, error } = useAsyncCallback(doSell)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Swap
      {...props}
      base={{
        key: WUM_TOKEN,
        name: "WUM",
        price: inverseCurve,
      }}
      target={{
        key: SOL_TOKEN,
        name: "SOL",
        price: curve,
      }}
      swap={execute}
    />
  )
}