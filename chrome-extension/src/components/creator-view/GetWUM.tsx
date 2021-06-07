import React, { useState } from "react"
import { Alert, Button, Form, InputNumber } from "antd"
import { buy } from "../../utils/action"
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
  SOL_TOKEN,
  WUM_BONDING,
  WUM_REWARDS_PERCENTAGE,
  WUM_TOKEN,
} from "../../constants/globals"
import { useAccount } from "../../utils/account"
import { LogCurveV0, TokenBondingV0 } from "../../spl-token-bonding-api/state"

interface Props {
  setShowWalletConnect: any
}

export default (props: Props) => {
  const connection = useConnection()
  const { curve, inverseCurve, loading } = usePricing(WUM_BONDING)
  const { wallet, awaitingApproval } = useWallet()
  const doBuy = async (baseAmount: number, targetAmount: number) => {
    await buy(wallet)(connection, WUM_BONDING, targetAmount)
  }
  const { execute, error } = useAsyncCallback(doBuy)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Swap
      {...props}
      base={{
        key: SOL_TOKEN,
        name: "SOL",
        price: curve,
      }}
      target={{
        key: WUM_TOKEN,
        name: "WUM",
        price: inverseCurve,
      }}
      swap={execute}
    />
  )
}
