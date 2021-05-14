import React from "react";
import {Modal} from "antd";

export interface BuyParams {
  amount: number,
  solcloutLimit: number
}

export type OnBuy = (params: BuyParams) => void

interface BuyModalProps {
  onBuy: OnBuy,
  isVisible: boolean,
  creatorName: string,
  setIsVisible: (visible: boolean) => void,
}

export default ({creatorName, onBuy, isVisible, setIsVisible}: BuyModalProps) => {
  return <Modal
    title={`Buy ${creatorName} Creator Coins`}
    visible={isVisible} onOk={() => setIsVisible(false)}
    onCancel={() => setIsVisible(false)}
  >
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </Modal>
}