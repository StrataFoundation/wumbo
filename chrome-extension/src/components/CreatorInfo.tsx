import React, { useState, useRef, useEffect } from "react";
import { Button, Popover, Tag } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useCreatorInfo } from "../utils/creatorState";
import CreatorView from "./creator-view/CreatorView";
import Loading from "./Loading";
import {
  WUMBO_INSTANCE_KEY,
  WUMBO_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
  TOKEN_BONDING_PROGRAM_ID,
  SPL_NAME_SERVICE_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
} from "../constants/globals";
import { createWumboCreator } from "../wumbo-api/bindings";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { Account } from "@solana/web3.js";
import { useAccount } from "../utils/account";
import { WumboInstance } from "../wumbo-api/state";
import { useWallet } from "../utils/wallet";

interface CreatorInfoProps {
  creatorName: string;
  creatorImg: string;
}

interface InterceptorProps {
  onClick?: any;
  children: any;
}

const ClickInterceptor = ({ onClick, children, ...rest }: InterceptorProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };
  return (
    <button className="interceptor-button" onClick={handleClick} tabIndex={0}>
      <Tag>
        {children} <DownOutlined />
      </Tag>
    </button>
  );
};

export default ({ creatorName, creatorImg }: CreatorInfoProps) => {
  const creatorInfoState = useCreatorInfo(creatorName);
  const { creatorInfo, loading } = creatorInfoState;
  const { wallet } = useWallet();
  const [creationLoading, setCreationLoading] = useState<boolean>(false);
  const connection = useConnection();
  const { info: wumboInstance } = useAccount(
    WUMBO_INSTANCE_KEY,
    WumboInstance.fromAccount
  );

  if (loading) {
    return <Loading />;
  }

  console.log(`Loading ${loading}, creator info ${creatorInfo}, wumbo ${wumboInstance}, wallet ${wallet}`)
  if (!loading && !creatorInfo && wumboInstance && wallet) {
    const createCreator = () => {
      setCreationLoading(true);
      createWumboCreator(connection, {
        splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
        splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        splTokenProgramId: TOKEN_PROGRAM_ID,
        splWumboProgramId: WUMBO_PROGRAM_ID,
        splNameServicePogramId: SPL_NAME_SERVICE_PROGRAM_ID,
        wumboInstance: WUMBO_INSTANCE_KEY,
        payer: wallet,
        baseMint: wumboInstance.wumboMint,
        name: creatorName,
        founderRewardsPercentage: 5.5,
        nameParent: TWITTER_ROOT_PARENT_REGISTRY_KEY,
      })
        .then(() => {
          setCreationLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setCreationLoading(false);
        });
    };

    return (
      <Button type="link" onClick={createCreator}>
        {creationLoading && (
          <Loading color="white" fontSize={12} marginRight={4} />
        )}{" "}
        Create Coin
      </Button>
    );
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
  );
};
