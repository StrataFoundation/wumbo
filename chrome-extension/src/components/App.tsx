import React, {useState} from 'react'
import {ConnectionProvider} from "@oyster/common/lib/contexts/connection"
import TweetDecorations from "./TweetDecorations";
import {Action, DispatchActionContext} from "../utils/action";
import ActionModal from "./ActionModal";

export default () => {
  const [currentAction, setAction] = useState<Action>()
  return <ConnectionProvider>
    <DispatchActionContext.Provider
      value={setAction}
    >
      <TweetDecorations />
    </DispatchActionContext.Provider>
    <ActionModal action={currentAction} complete={() => setAction(undefined)} />
  </ConnectionProvider>
}
