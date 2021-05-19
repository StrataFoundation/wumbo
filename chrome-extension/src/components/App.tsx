import React from "react"
import { ConnectionProvider } from "@oyster/common/lib/contexts/connection"
import TweetDecorations from "./TweetDecorations"
import "antd/dist/antd.css"
import LoginProvider from "./LoginProvider"
import { UsdSolcloutPriceProvider } from "../utils/pricing"

import "../index.css"

export default () => {
  return (
    <ConnectionProvider>
      <UsdSolcloutPriceProvider>
        <LoginProvider />
        <TweetDecorations />
      </UsdSolcloutPriceProvider>
    </ConnectionProvider>
  )
}
