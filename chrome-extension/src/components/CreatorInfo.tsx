import React, { useState, useRef, useEffect } from "react"
import { Button, Popover, Tag } from "antd"
import { DownOutlined } from "@ant-design/icons"
import { useCreatorInfo } from "../utils/creatorState"
import CreatorView from "./creator-view/CreatorView"
import Loading from "./Loading"
import {
  KEYPAIR,
  SOLCLOUT_INSTANCE_KEY,
  SOLCLOUT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../globals"
import { createSolcloutCreator } from "../solclout-api/bindings"
import { useConnection } from "@oyster/common/lib/contexts/connection"
import { Account } from "@solana/web3.js"

interface CreatorInfoProps {
  creatorName: string
  creatorImg: string
}

interface InterceptorProps {
  onClick?: any
  children: any
}

const ClickInterceptor = ({ onClick, children, ...rest }: InterceptorProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick()
    }
  }
  return (
    <button className="interceptor-button" onClick={handleClick} tabIndex={0}>
      <Tag>
        ${children} <DownOutlined />
      </Tag>
    </button>
  )
}

export default ({ creatorName, creatorImg }: CreatorInfoProps) => {
  const creatorInfoState = useCreatorInfo(creatorName)
  const { creatorInfo, loading } = creatorInfoState
  const [creationLoading, setCreationLoading] = useState<boolean>(false)
  const connection = useConnection()

  if (loading) {
    return <Loading />
  }

  if (!loading && !creatorInfo) {
    const createCreator = () => {
      setCreationLoading(true)
      createSolcloutCreator(connection, {
        programId: SOLCLOUT_PROGRAM_ID,
        tokenProgramId: TOKEN_PROGRAM_ID,
        payer: new Account(KEYPAIR.secretKey),
        solcloutInstance: SOLCLOUT_INSTANCE_KEY,
        name: creatorName,
        founderRewardsPercentage: 5.5,
        nameParent: TWITTER_ROOT_PARENT_REGISTRY_KEY,
      })
        .then(() => {
          setCreationLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setCreationLoading(false)
        })
    }

    return (
      <Button type="link" onClick={createCreator}>
        {creationLoading && (
          <Loading color="white" fontSize={12} marginRight={4} />
        )}{" "}
        Create Coin
      </Button>
    )
  }

  return (
    <Popover
      placement="bottom"
      trigger="click"
      content={() => (
        <CreatorView creatorImg={creatorImg} {...creatorInfoState} />
      )}
    >
      <ClickInterceptor>
        ${creatorInfo?.coinPriceUsd.toFixed(2)}
      </ClickInterceptor>
    </Popover>
  )
}
