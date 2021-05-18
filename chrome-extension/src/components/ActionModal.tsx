import React, {FunctionComponent, useEffect} from "react";
import {Modal} from "antd";
import {Action, ActionData} from "../utils/action";
import Buy from "./actions/Buy";
import Sell from "./actions/Sell";

type Complete = (action: Action | undefined, reason: string) => void

interface ActionModalProps {
  action?: Action,
  complete: Complete
}

export interface ActionProps {
  data: ActionData,
  onComplete: () => void
}

const actions: Record<string, FunctionComponent<ActionProps>> = {
  BUY: Buy,
  SELL: Sell,
}

export default ({action, complete}: ActionModalProps) => {
  // https://github.com/ant-design/ant-design/issues/21539
  useEffect(() => {
      document.body.style.removeProperty('overflow')
  })

  const ActionComponent = action && actions[action.type]

  return <Modal
    afterClose={() => {
      // https://github.com/ant-design/ant-design/issues/21539
      document.body.style.removeProperty('overflow')
    }}
    bodyStyle={{ overflow: 'visible' }}
    title={`${action?.prettyName} ${action?.data.creatorName}`}
    visible={!!action}
    onOk={() => complete(action, 'OK')}
    onCancel={() => complete(action, 'CANCEL')}
    footer={[]}
  >
    { ActionComponent && action && <ActionComponent
        data={action.data}
        onComplete={() => complete(action, 'COMPLETE')}
    /> }
  </Modal>
}