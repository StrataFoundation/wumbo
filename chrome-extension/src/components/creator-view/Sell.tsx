import React, { useState } from "react";
import { Alert, Button, Form, InputNumber } from "antd";
import { sell } from "../../utils/action";
import { WumboCreator } from "../../wumbo-api/state";
import { useAsyncCallback } from "react-async-hook";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { Token } from "./Token";
import { useAssociatedAccount } from "../../utils/walletState";
import { useAccount } from "../../utils/account";
import { TokenBondingV0 } from "../../spl-token-bonding-api/state";
import { useWallet } from "../../utils/wallet";

interface SellProps {
  creator: WumboCreator;
}

export default ({ creator }: SellProps) => {
  const connection = useConnection();
  const { wallet } = useWallet();
  const { execute, loading, error } = useAsyncCallback(sell(wallet));
  const [success, setSuccess] = useState<string>();
  const [amount, setAmount] = useState<number>(0);
  const handleFinish = async () => {
    await execute(connection, creator, amount);
    setSuccess(`Sold ${amount} creator coins!`);
    // Hide the success after a bit
    setTimeout(() => setSuccess(undefined), 4000);
  };

  const handleChange = (value: number) => {
    setAmount(value);
  };
  const { info: creatorTokenBonding } = useAccount(
    creator.tokenBonding,
    TokenBondingV0.fromAccount
  );

  const { associatedAccount, loading: accountLoading } = useAssociatedAccount(
    wallet?.publicKey,
    creatorTokenBonding?.targetMint
  );
  const ownAmount =
    associatedAccount &&
    (associatedAccount.amount.toNumber() / Math.pow(10, 9)).toFixed(2);
  return (
    <Form name="sell" onFinish={handleFinish}>
      <div className="price-block">
        <div className="price-block-header">
          <span>To</span>
          <span>Balance: 0.0</span>
        </div>
        <div className="price-block-body">
          <Form.Item name="amount" rules={[{ required: true }]}>
            <InputNumber
              bordered={false}
              min={0}
              precision={9}
              step={0.01}
              defaultValue={amount}
              value={amount}
              onChange={handleChange}
            />
          </Form.Item>
          <Token name="NXX2" size="small" />
        </div>
      </div>

      <div className="price-block-arrow">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAALBAMAAAC5XnFsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURZWW/0dwTJWX/5WW/5qa/5aY/5+f/5WX/5eX/5mZ/5aW/5aX/5aW/5WW/5WW/7hJc2AAAAAPdFJOU+0AlP0nXQ/Weh46uqPbzObatoYAAAA5SURBVAjXYxAUFAoUFGQQFBRQxEVFACnJIwzN2wQUF7AwiJo7qNo6MgguYHi8DahEstgIrDIdqBIAYfcLSE0T1vMAAAAASUVORK5CYII=" />
      </div>

      <div className="price-block">
        <div className="price-block-header">
          <span>From</span>
          <span>Balance: 430.02</span>
        </div>
        <div className="price-block-body">
          <span className="price-block-price">{(amount / 4).toFixed(9)}</span>
          <Token
            name="SOL"
            size="small"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAMAAABFjsb+AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAADAUExURUdwTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEEFQMEBgA0KBEcJzslWAIhIwOwtkc1cQYrLisvUEgTXI9265pl6QDbqR0IJagLxjuRuA5IUwDKsCmoxk5ro4lEwQC8sVuT0WZQpME5+SF+lZgzxi5IaFpeozlAaz9xm06m2niL5AB2UjA3WwCFbn54239Sv7IF0QDCqg8+SMIg7yRRaC8NPaIjyy+aualV7xahtrJM8z20n3QAAAANdFJOUwDfY/4HGqjvvGoBFWIK+JSXAAAA1klEQVQY022Q5w6DMAyEQyAl0LrpYtNJ9957vP9b1abqkvh+RafL2T7GCGFJUzelJdgbg2vwQuPGS8rn4Esun7p+JRTRaXN8VF3XLaUoKNhMYJbbaNdq3VYripYKNMEsgHKn17jeUd2vFX6ymAQolokqkiZKZgLE/f5k0pnNhsMmaSbTAVQlDILFojeftw+o6eRD0XGc6XQ8PjUV+STZz75fQTzPU5SHc5V/HAwetzAMNqt0Lu4X13f1y2iUJFuHbhZ0hyq+oRxuZ96b2ctffwXj0+p/z086vBYG9a898QAAAABJRU5ErkJggg=="
          />
        </div>
      </div>

      <div className="price-block-actions">
        <span>Own: {ownAmount} NXX2</span>
        <Form.Item>
          <Button loading={loading} htmlType="submit" type="primary">
            Sell
          </Button>
        </Form.Item>
      </div>
      {error && <Alert type="error" message={error.toString()} />}
      {success && <Alert type="success" message={success} />}
    </Form>
  );
};
