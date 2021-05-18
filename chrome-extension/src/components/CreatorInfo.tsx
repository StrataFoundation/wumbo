import React from 'react'
import {Button, Popover, Tag} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import {useCreatorInfo} from "../utils/creatorState";
import CreatorView from "./CreatorView";
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

interface CreatorInfoProps {
  creatorName: string
}

export default ({ creatorName }: CreatorInfoProps) => {
  const creatorInfoState = useCreatorInfo(creatorName)
  const { creatorInfo, loading } = creatorInfoState
  const connection = useConnection()

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

  return <div
    style={{ zIndex: 10000 }}
  >
    <Popover
      style={{ width: "300px" }}
      mouseLeaveDelay={2}
      placement="bottom"
      content={() => <CreatorView {...creatorInfoState} />}
    >
      <Tag>
        ${creatorInfo?.coinPriceUsd.toFixed(2)} <DownOutlined/>
      </Tag>
    </Popover>
  </div>
}