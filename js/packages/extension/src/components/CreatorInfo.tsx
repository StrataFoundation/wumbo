import React from "react";
import { Link } from "react-router-dom";
import { WUMBO_INSTANCE_KEY } from "@/constants/globals";
import { WumboInstance } from "@/wumbo-api/state";
import { useCreatorInfo } from "@/utils/creatorState";
import { useWallet } from "wumbo-common";
import { useAccount } from "@/utils/account";
import { Button, Spinner } from "wumbo-common";

import { useDrawer } from "@/contexts/drawerContext";
import { routes } from "@/constants/routes";

type Props = {
  creatorName: string;
  creatorImg: string;
};

const CreatorInfo: React.FC<Props> = ({ creatorName, creatorImg }: Props) => {
  const { state, dispatch } = useDrawer();

  const creatorInfoState = useCreatorInfo(creatorName);
  const { creatorInfo, loading } = creatorInfoState;
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
      <Link to={routes.create.path}>
        <Button size="xs" color="primary" onClick={toggleDrawer}>
          Create Coin
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
    ) + `?name=@${creatorName}`;

  return (
    <Link to={path}>
      <Button size="xs" color="secondary" onClick={toggleDrawer}>
        <span className="!text-green-800">
          ${creatorInfo?.coinPriceUsd.toFixed(2)}
        </span>
      </Button>
    </Link>
  );
};

export default CreatorInfo;
