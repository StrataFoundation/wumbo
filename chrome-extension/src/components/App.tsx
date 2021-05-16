import React, {useState} from 'react'
import {ConnectionProvider} from "@oyster/common/lib/contexts/connection"
import TweetDecorations from "./TweetDecorations";
import {Action, DispatchActionContext} from "../utils/action";
import ActionModal from "./ActionModal";
import 'antd/dist/antd.css'
import LoginProvider from "./LoginProvider";
import {UsdSolcloutPriceProvider} from "../utils/pricing";

export default () => {
  const [currentAction, setAction] = useState<Action>()

  return <ConnectionProvider>
    <DispatchActionContext.Provider
      value={setAction}
    >
      <UsdSolcloutPriceProvider>
        <LoginProvider />
        <TweetDecorations />
      </UsdSolcloutPriceProvider>
    </DispatchActionContext.Provider>
    <ActionModal action={currentAction} complete={() => setAction(undefined)} />
  </ConnectionProvider>
}
