import React, {useState} from 'react'
import {Dropdown, Menu, Tag} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import 'antd/dist/antd.css'
import BuyModal, {OnBuy} from "./BuyModal";
import {useCreatorInfo, useCreatorKey} from "../utils/creatorState";
import Loading from './Loading';
import {KEYPAIR, SOLCLOUT_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID} from "../globals";
import {buyCreatorCoinsWithWallet} from "../solclout-api/bindings";
import {useConnection} from "@oyster/common/lib/contexts/connection"
import {Account} from "@solana/web3.js";

interface CreatorInfoProps {
  onBuy: OnBuy,
  creatorName: string
}

export default ({ onBuy, creatorName }: CreatorInfoProps) => {
  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);
  const creatorInfo = useCreatorInfo(creatorName)
  const connection = useConnection()
  const creatorKey = useCreatorKey(creatorName)
  // const handleBuy = () => setIsBuyModalVisible(true)
  const handleBuy = () => {
    if (creatorKey) {
      buyCreatorCoinsWithWallet(connection, {
        programId: SOLCLOUT_PROGRAM_ID,
        splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        solcloutCreator: creatorKey,
        purchaserWallet: new Account(KEYPAIR.secretKey),
        lamports: 10000000000
      })
    }
  }
  const menu = (
    <Menu>
      <Menu.Item onClick={handleBuy} key="buy">Buy</Menu.Item>
      <Menu.Item key="sell">Sell</Menu.Item>
      <Menu.Item key="stats">Stats</Menu.Item>
    </Menu>
  );

  if (!creatorInfo) {
    return <Loading />
  }

  return <>
    <Dropdown overlay={menu}>
      <Tag onClick={e => e.preventDefault()}>
        {creatorInfo.coinPrice.toFixed(2)} <DownOutlined/>
      </Tag>

    </Dropdown>
    <BuyModal
      isVisible={isBuyModalVisible}
      setIsVisible={setIsBuyModalVisible}
      creatorName={creatorName}
      onBuy={onBuy}
    />
  </>
}