import React, { useState, useRef, useEffect } from "react"
import { Button, Popover, Tag } from "antd"
import { DownOutlined } from "@ant-design/icons"
import { useCreatorInfo, useCreatorKey } from "../utils/creatorState"
import CreatorView from "./creator-view/CreatorView"
import Loading from "./Loading"
import { WUMBO_INSTANCE_KEY } from "../constants/globals"
import { useConnection } from "@oyster/common/lib/contexts/connection"
import { useAccount } from "../utils/account"
import { WumboInstance } from "../wumbo-api/state"
import { useWallet } from "../utils/wallet"
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
        {children} <DownOutlined />
      </Tag>
    </button>
  )
}

export default ({ creatorName, creatorImg }: CreatorInfoProps) => {
  const key = useCreatorKey(creatorName)
  const creatorInfoState = useCreatorInfo(creatorName)
  const { creatorInfo, loading } = creatorInfoState
  const { wallet } = useWallet()
  const connection = useConnection()
  const { info: wumboInstance } = useAccount(
    WUMBO_INSTANCE_KEY,
    WumboInstance.fromAccount
  )

  if (!loading && !creatorInfo && wumboInstance && wallet) {
    return (
      <Popover
        placement="bottom"
        trigger="click"
        content={() => (
          <CreatorView
            wumboInstance={wumboInstance}
            connection={connection}
            wallet={wallet}
            creatorImg={creatorImg}
            {...creatorInfoState}
            creatorName={creatorName}
          />
        )}
      >
        <Button type="link">Create Coin</Button>
      </Popover>
    )
  }

  if (loading || !creatorInfo || !wumboInstance) {
    return <Loading />
  }

  return (
    <Popover
      placement="bottom"
      trigger="click"
      content={() => (
        <CreatorView
          wumboInstance={wumboInstance}
          connection={connection}
          wallet={wallet}
          creatorImg={creatorImg}
          {...creatorInfoState}
          creatorName={creatorName}
        />
      )}
    >
      <ClickInterceptor>
        ${creatorInfo?.coinPriceUsd.toFixed(2)}
      </ClickInterceptor>
    </Popover>
  )
}
