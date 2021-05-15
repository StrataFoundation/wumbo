import React, {useEffect, useState} from 'react'
import {ConnectionProvider} from "@oyster/common/lib/contexts/connection"
import TweetDecorations from "./TweetDecorations";
import {Action, DispatchActionContext, useLogin} from "../utils/action";
import ActionModal from "./ActionModal";
import 'antd/dist/antd.css'

export default () => {
  const [currentAction, setAction] = useState<Action>()
  const { login, account, error } = useLogin()
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.type == 'LOGIN') {
      login().then(account => sendResponse({ account }))
    }
  });

  useEffect(() => {
    if (account || error) {
      debugger
      chrome.runtime.sendMessage({
        type: 'ACCOUNT',
        data: {
          account,
          error
        }
      })
    }
  }, [account, error])

  return <ConnectionProvider>
    <DispatchActionContext.Provider
      value={setAction}
    >
      <TweetDecorations />
    </DispatchActionContext.Provider>
    <ActionModal action={currentAction} complete={() => setAction(undefined)} />
  </ConnectionProvider>
}
