import React from "react";
import { Link } from "react-router-dom";
import { WUMBO_INSTANCE_KEY } from "wumbo-common";
import { WumboInstance } from "spl-wumbo";
import { useUserInfo } from "@/utils/userState";
import { useWallet } from "wumbo-common";
import { useAccount } from "wumbo-common";
import { Button, Spinner } from "wumbo-common";

import { useDrawer } from "@/contexts/drawerContext";
import { routes } from "@/constants/routes";
import { useConnection, useConnectionConfig } from "@oyster/common";

type Props = {
  creatorName: string;
  creatorImg: string;
};

export const MainButton: React.FC<Props> = ({
  creatorName,
  creatorImg,
}: Props) => {
  const { state, dispatch } = useDrawer();

  const creatorInfoState = useUserInfo(creatorName);
  const { userInfo: creatorInfo, loading } = creatorInfoState;
  const { wallet } = useWallet();
  const { info: wumboInstance } = useAccount(
    WUMBO_INSTANCE_KEY,
    WumboInstance.fromAccount
  );

  const toggleDrawer = () => {
    !state.isOpen &&
      dispatch({
        type: "toggle",
        data: {
          creatorName,
          creatorImg,
          tokenBondingKey: creatorInfo?.tokenBonding.publicKey,
        },
      });
  };

  if (!loading && !creatorInfo && wumboInstance && wallet) {
    return (
      <Link to={routes.create.path + `?name=${creatorName}&src=${creatorImg}`}>
        <Button block size="xs" color="primary" onClick={toggleDrawer}>
          Mint
        </Button>
      </Link>
    );
  }

  if (loading || !creatorInfo || !wumboInstance) {
    return <Spinner />;
  }

  const path =
    routes.trade.path.replace(
      ":tokenBondingKey",
      creatorInfo.tokenBonding.publicKey.toBase58()
    ) + `?name=${creatorName}`;

  return (
    <Link to={path}>
      <Button block size="xs" color="secondary" onClick={toggleDrawer}>
        <span className="!text-green-800">
          ${creatorInfo?.coinPriceUsd.toFixed(2)}
        </span>
      </Button>
    </Link>
  );
};
