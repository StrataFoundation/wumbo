import React from 'react';
import {Button, Form, InputNumber} from "antd";
import {useSellAction} from '../../utils/action';
import {ActionProps} from "../ActionModal";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

export default ({ data, onComplete}: ActionProps) => {
  const [buy, error] = useSellAction(data)
  return <Form
    {...layout}
    name="sell"
    onFinish={({ amount }) => {
      buy(amount).then(onComplete)
    }}
  >
    <Form.Item
      label="Amount"
      name="amount"
      rules={[{ required: true }]}
    >
      <InputNumber style={{ width: '100%' }} min={0} precision={9} step={0.01} />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" type="primary">Sell!</Button>
    </Form.Item>
    <Form.ErrorList errors={[error]} />
  </Form>
}