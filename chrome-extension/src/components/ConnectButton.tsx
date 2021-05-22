import { Button, Dropdown, Menu } from "antd";
import { ButtonProps } from "antd/lib/button";
import React from "react";
import { useWallet } from "../utils/wallet";

export interface ConnectButtonProps
  extends ButtonProps,
    React.RefAttributes<HTMLElement> {
  allowWalletChange?: boolean;
  selectWallet: () => void;
}

export default (props: ConnectButtonProps) => {
  const { wallet, connected, connect, provider } = useWallet();
  const {
    onClick,
    children,
    disabled,
    allowWalletChange,
    selectWallet,
    ...rest
  } = props;

  const connectOrSelect = () => {
    if (wallet) {
      connect();
    } else {
      selectWallet();
    }
  };
  // only show if wallet selected or user connected
  const menu = (
    <Menu>
      <Menu.Item key="3" onClick={selectWallet}>
        Change Wallet
      </Menu.Item>
    </Menu>
  );

  if (!provider || !allowWalletChange) {
    return (
      <Button
        {...rest}
        onClick={connected ? onClick : connectOrSelect}
        disabled={connected && disabled}
      >
        {connected ? props.children : "Connect"}
      </Button>
    );
  }

  return (
    <Dropdown.Button
      onClick={connected ? onClick : connect}
      disabled={connected && disabled}
      overlay={menu}
    >
      Connect
    </Dropdown.Button>
  );
};
