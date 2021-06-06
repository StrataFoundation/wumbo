import React, { useState } from "react";
import { Alert, Button, Form, InputNumber } from "antd";
import { useAsyncCallback } from "react-async-hook";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { Token } from "./Token";
import { useAssociatedAccount } from "../../utils/walletState";
import { useWallet } from "../../utils/wallet";
import { PublicKey } from "@solana/web3.js";
import { AccountInfo as TokenAccountInfo } from "@solana/spl-token";

interface TokenInfo {
  key: PublicKey;
  name: string;
  src?: string;
  price(other: number): number;
}

interface SwapProps {
  base: TokenInfo;
  target: TokenInfo;
  swap(base: number, target: number): Promise<void>;
}
function getOwnedUIAmount(account: TokenAccountInfo | undefined): string {
  return account
    ? (account.amount.toNumber() / Math.pow(10, 9)).toFixed(2)
    : "";
}
export default ({ swap, base, target }: SwapProps) => {
  const connection = useConnection();
  const { wallet, awaitingApproval } = useWallet();
  const { execute, loading, error } = useAsyncCallback(swap);
  const [success, setSuccess] = useState<string>();
  const [{ baseAmount, targetAmount }, setAmounts] = useState<{
    baseAmount: number;
    targetAmount: number;
  }>({
    baseAmount: 0,
    targetAmount: 0,
  });
  const {
    associatedAccount: targetAccount,
    loading: targetAccountLoading,
  } = useAssociatedAccount(wallet?.publicKey || undefined, target.key);
  const {
    associatedAccount: baseAccount,
    loading: baseAccountLoading,
  } = useAssociatedAccount(wallet?.publicKey || undefined, base.key);

  error && console.error(error);

  const setBase = (amount: number) => {
    try {
      setAmounts({
        baseAmount: amount,
        targetAmount: target.price(amount),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const setTarget = (amount: number) => {
    setAmounts({
      targetAmount: amount,
      baseAmount: base.price(amount),
    });
  };

  const handleFinish = async () => {
    await execute(baseAmount, targetAmount);
    setSuccess(`Got ${targetAmount} coins!`);
    // Hide the success after a bit
    setTimeout(() => setSuccess(undefined), 4000);
  };

  return (
    <Form onFinish={handleFinish}>
      <div className="price-block">
        <div className="price-block-header">
          <span>From</span>
          <span>Balance: {getOwnedUIAmount(baseAccount)}</span>
        </div>
        <div className="price-block-body">
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
          {<Token name={base.name} src={base.src} size="small" />}
        </div>
      </div>

      <div className="price-block-arrow">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAALBAMAAAC5XnFsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURZWW/0dwTJWX/5WW/5qa/5aY/5+f/5WX/5eX/5mZ/5aW/5aX/5aW/5WW/5WW/7hJc2AAAAAPdFJOU+0AlP0nXQ/Weh46uqPbzObatoYAAAA5SURBVAjXYxAUFAoUFGQQFBRQxEVFACnJIwzN2wQUF7AwiJo7qNo6MgguYHi8DahEstgIrDIdqBIAYfcLSE0T1vMAAAAASUVORK5CYII=" />
      </div>

      <div className="price-block">
        <div className="price-block-header">
          <span>To</span>
          <span>Balance: {getOwnedUIAmount(targetAccount)}</span>
        </div>
        <div className="price-block-body">
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
          {<Token name={target.name} src={target.src} size="small" />}
        </div>
      </div>
      <div className="price-block-actions">
        <span>
          Own: {getOwnedUIAmount(targetAccount)} {target.name}
        </span>
        <Form.Item>
          {wallet && wallet.publicKey && (
            <Button loading={loading} htmlType="submit" type="primary">
              {awaitingApproval && "Awaiting Approval"}
              {!awaitingApproval && "Buy"}
            </Button>
          )}
        </Form.Item>
      </div>
      {error && <Alert type="error" message={error.toString()} />}
      {success && <Alert type="success" message={success} />}
    </Form>
  );
};
