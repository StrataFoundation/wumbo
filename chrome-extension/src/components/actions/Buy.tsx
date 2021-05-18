import React, {useState} from 'react';
import {Alert, Button, Form, InputNumber} from "antd";
import {buy} from '../../utils/action';
import {SolcloutCreator} from "../../solclout-api/state";
import {useAsyncCallback} from 'react-async-hook';
import {useConnection} from "@oyster/common/lib/contexts/connection"

interface BuyProps {
  creator: SolcloutCreator
}

export default ({ creator }: BuyProps) => {
  const connection = useConnection()
  const { execute, loading, error } = useAsyncCallback(buy)
  const [success, setSuccess] = useState<string>()
  const handleFinish = async ({ amount }: { amount: number }) => {
    await execute(connection, creator, amount)
    setSuccess(`Bought ${amount} creator coins!`)
    // Hide the success after a bit
    setTimeout(() => setSuccess(undefined), 4000)
  }

  return <Form
    name="buy"
    onFinish={handleFinish}
  >
    <Form.Item
      label="Amount"
      name="amount"
      rules={[{ required: true }]}
    >
      <InputNumber style={{ width: '100%' }} min={0} precision={9} step={0.01} />
    </Form.Item>
    <Form.Item>
      <Button loading={loading} htmlType="submit" type="primary">Buy</Button>
    </Form.Item>
    { error && <Alert type="error" message={error.toString()} />}
    { success && <Alert type="success" message={success} />}
  </Form>
}