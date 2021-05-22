import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface Props {
  color?: string;
  marginRight?: number;
  fontSize?: number;
}

export default ({ color, marginRight, fontSize }: Props) => {
  const loaderStyle = {
    fontSize: fontSize || 14,
    ...(color && { color }),
    ...(marginRight && { marginRight }),
  };
  const antIcon = <LoadingOutlined style={loaderStyle} spin />;
  return <Spin indicator={antIcon} />;
};
