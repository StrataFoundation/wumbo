import React from 'react'
import {Button, Dropdown, Menu, Tag} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import {useCreatorInfo} from "../utils/creatorState";
import Loading from './Loading';
import {
  KEYPAIR,
  SOLCLOUT_INSTANCE_KEY,
  SOLCLOUT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY
} from "../globals";
import {createSolcloutCreator} from "../solclout-api/bindings";
import {useConnection} from "@oyster/common/lib/contexts/connection"
import {Account} from "@solana/web3.js";
import {useCreatorActions} from "../utils/action";

interface CreatorInfoProps {
  creatorName: string
}

export default ({ creatorName }: CreatorInfoProps) => {
  const { creatorInfo, loading, actions } = useCreatorInfo(creatorName)
  const connection = useConnection()
  const dispatch = useCreatorActions()

  const menu = (
    <Menu>
      {actions.map(action =>
        <Menu.Item key={action.type} onClick={() => dispatch(action)}>{action.prettyName}</Menu.Item>
      )}
    </Menu>
  );

  if (loading) {
    return <Loading />
  }

  if (!loading && !creatorInfo) {
    const createCreator = () => createSolcloutCreator(connection, {
      programId: SOLCLOUT_PROGRAM_ID,
      tokenProgramId: TOKEN_PROGRAM_ID,
      payer: new Account(KEYPAIR.secretKey),
      solcloutInstance: SOLCLOUT_INSTANCE_KEY,
      name: creatorName,
      founderRewardsPercentage: 5.5,
      nameParent: TWITTER_ROOT_PARENT_REGISTRY_KEY
    })
    return <Button type="link" onClick={createCreator}>Create Coin</Button>
  }

  return <>
    <Dropdown overlay={menu}>
      <Tag onClick={e => e.preventDefault()}>
        ${creatorInfo?.coinPriceUsd.toFixed(2)} <DownOutlined/>
      </Tag>

    </Dropdown>
  </>
}