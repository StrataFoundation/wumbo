import React, { FC } from "react";
import { Link } from "react-router-dom";
import { WumboInstance } from "spl-wumbo";
import { useUserInfo } from "@/utils/userState";
import { useAccount } from "wumbo-common";
import { WUMBO_INSTANCE_KEY, Button, IButtonProps, Spinner, ISpinnerProps } from "wumbo-common";

import { useDrawer } from "@/contexts/drawerContext";
import { routes } from "@/constants/routes";

type Props = {
  creatorName: string;
  creatorImg: string;
  btnProps?: Exclude<IButtonProps, "onClick">;
  spinnerProps?: ISpinnerProps;
};

export const MainButton: FC<Props> = ({
  creatorName,
  creatorImg,
  btnProps,
  spinnerProps,
}: Props) => {
  const { isOpen, toggle } = useDrawer();
  const creatorInfoState = useUserInfo(creatorName);
  const { userInfo: creatorInfo, loading } = creatorInfoState;
  const { info: wumboInstance } = useAccount(WUMBO_INSTANCE_KEY, WumboInstance.fromAccount);

  const toggleDrawer = () => {
    !isOpen && toggle({ creator: { name: creatorName, img: creatorImg } });
  };

  if (!loading && !creatorInfo && wumboInstance) {
    return (
      <Link
        to={routes.create.path + `?name=${creatorName}&src=${creatorImg}`}
        className="no-underline"
      >
        <Button block outline size="xs" color="primary" onClick={toggleDrawer} {...btnProps}>
          Mint
        </Button>
      </Link>
    );
  }

  if (loading || !creatorInfo || !wumboInstance) {
    return <Spinner {...spinnerProps} />;
  }

  const path =
    routes.trade.path.replace(":tokenBondingKey", creatorInfo.tokenBonding.publicKey.toBase58()) +
    `?name=${creatorName}`;

  return (
    <Link to={path} className="no-underline">
      <Button block size="xs" color="secondary" onClick={toggleDrawer} {...btnProps}>
        <span className="!text-green-800">${creatorInfo?.coinPriceUsd.toFixed(2)}</span>
      </Button>
    </Link>
  );
};
