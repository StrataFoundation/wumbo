import React, { useState } from "react"
import { Alert, Button, Form, InputNumber } from "antd"
import { useAsyncCallback } from "react-async-hook"
import { useConnection } from "@oyster/common/lib/contexts/connection"
import { Token } from "./Token"
import { useAssociatedAccount } from "../../utils/walletState"
import { useWallet } from "../../utils/wallet"
import { PublicKey } from "@solana/web3.js"
import { AccountInfo as TokenAccountInfo } from "@solana/spl-token"

interface TokenInfo {
  key: PublicKey
  name: string
  src?: string
  price(other: number): number
}

interface SwapProps {
  base: TokenInfo
  target: TokenInfo
  swap(base: number, target: number): Promise<void>
  setShowWalletConnect: any
}
function getOwnedUIAmount(account: TokenAccountInfo | undefined): string {
  return account ? (account.amount.toNumber() / Math.pow(10, 9)).toFixed(2) : ""
}
export default ({ swap, base, target, setShowWalletConnect }: SwapProps) => {
  const connection = useConnection()
  const { wallet, awaitingApproval } = useWallet()
  const { execute, loading, error } = useAsyncCallback(swap)
  const [success, setSuccess] = useState<string>()
  const [{ baseAmount, targetAmount }, setAmounts] = useState<{
    baseAmount: number
    targetAmount: number
  }>({
    baseAmount: 0,
    targetAmount: 0,
  })
  const {
    associatedAccount: targetAccount,
    loading: targetAccountLoading,
  } = useAssociatedAccount(wallet?.publicKey || undefined, target.key)
  const {
    associatedAccount: baseAccount,
    loading: baseAccountLoading,
  } = useAssociatedAccount(wallet?.publicKey || undefined, base.key)

  error && console.error(error)

  const setBase = (amount: number) => {
    try {
      setAmounts({
        baseAmount: amount,
        targetAmount: target.price(amount),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const setTarget = (amount: number) => {
    setAmounts({
      targetAmount: amount,
      baseAmount: base.price(amount),
    })
  }

  const handleFinish = async () => {
    await execute(baseAmount, targetAmount)
    setSuccess(`Got ${targetAmount} coins!`)
    // Hide the success after a bit
    setTimeout(() => setSuccess(undefined), 4000)
  }

  return (
    <Form onFinish={handleFinish} className="price-form">
      <div className="prices">
        <div className="price-side">
          <div className="price-block">
            <div className="price-block-header">
              {<Token name={base.name} src={base.src} size="small" />}
            </div>
            <div className="price-block-body">
              <span>From</span>
              <Form.Item rules={[{ required: true }]}>
                <InputNumber
                  bordered={false}
                  min={0}
                  precision={9}
                  step={0.01}
                  defaultValue={baseAmount}
                  value={baseAmount}
                  onChange={setBase}
                />
              </Form.Item>
            </div>
          </div>
          <div className="price-block-balance">
            <span>Balance: {getOwnedUIAmount(baseAccount)}</span>
          </div>
        </div>

        <div className="price-block-arrow">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAANBAMAAABWYCMqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAhUExURUdwTJaW/5aX/5WW/7y8/5aX/5aX/5eX/7a2/5aY/5WW/51dQm0AAAAKdFJOUwDAZtoDrZdCB353Bo3RAAAASklEQVQI12Ng4EhngALXxQ4QBkvUKgUIi23VKhMIa9aqVYsFgUCIQVEQAoQY0EFZA5TBYhUCZTGtWgo11HnVqgSIXqtVq1YiTAEAz3MQNZe/tSIAAAAASUVORK5CYII=" />
        </div>
        <div className="price-side">
          <div className="price-block">
            <div className="price-block-header">
              {<Token name={target.name} src={target.src} size="small" />}
            </div>
            <div className="price-block-body">
              <span>To</span>
              <Form.Item rules={[{ required: true }]}>
                <InputNumber
                  bordered={false}
                  min={0}
                  precision={9}
                  step={0.01}
                  defaultValue={targetAmount}
                  value={targetAmount}
                  onChange={setTarget}
                />
              </Form.Item>
            </div>
          </div>
          <div className="price-block-balance">
            <span>Balance: {getOwnedUIAmount(targetAccount)}</span>
          </div>
        </div>
      </div>
      <div className="price-block-actions">
        <span>
          Own: {getOwnedUIAmount(targetAccount)} {target.name}
        </span>
        <Form.Item>
          {wallet && wallet.publicKey ? (
            <Button loading={loading} htmlType="submit" type="primary">
              {awaitingApproval && "Awaiting Approval"}
              {!awaitingApproval && "Trade"}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setShowWalletConnect(true)
              }}
              type="primary"
            >
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAPCAYAAAACsSQRAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEaADAAQAAAABAAAADwAAAABRQ7riAAABPElEQVQ4EZWTsUtCURTGu2VgRYOzUzU0ZO7+AwqRBNE/0OQQTc1B/RcugrQIreLS5FCtJtrY0hKhBSah5PD6fXIv3B6V1wPfu+ec+53vnvveeWYBi6JoiaUI1hX/YeK0jTGt+L5BwJD8BE/gIU6IxUfEBwjd+PkEwSlIsrHrb/zmc+Az+X3wQ0SdXJJcA20wy3IQ1Pm9JTY4/F2dJMEZqIMBCLE8pA1wRRNb6uSWIIXiTki1z6G2TPy6yOML9PzNOfwXcXWdYOPkNOQ9MLZFWdZusAgCGQo6oApc3SH+qgvwZ1oJRp13d+yYtrOVeUQuKO5TqFmZWKFN1utgETp4o0BfU9caWREN6kAiGp5gQ6zryAh+4E/fySPOCYkKq2vT8eLrnZdYxj8HBbWnv7MJtsEQ/Gdu3MXRDTT2tW/JTln0fT8PPgAAAABJRU5ErkJggg==" />
              Connect Wallet
            </Button>
          )}
        </Form.Item>
      </div>
      {error && <Alert type="error" message={error.toString()} />}
      {success && <Alert type="success" message={success} />}
    </Form>
  )
}
