import React, { FC } from "react";
import { Link } from "react-router-dom";
import { WumboInstance } from "@wum.bo/spl-wumbo";
import { useUserInfo } from "@/utils/userState";
import { useAccount } from "wumbo-common";
import { WUMBO_INSTANCE_KEY, Button, IButtonProps, Spinner, ISpinnerProps } from "wumbo-common";

import { useDrawer } from "@/contexts/drawerContext";
import { routes, tradePath } from "@/constants/routes";

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
  const { toggleDrawer } = useDrawer();
  const creatorInfoState = useUserInfo(creatorName);
  const { userInfo: creatorInfo, loading } = creatorInfoState;
  const { info: wumboInstance } = useAccount(WUMBO_INSTANCE_KEY, WumboInstance.fromAccount);

  if (!loading && !creatorInfo && wumboInstance) {
    return (
      <Link
        to={routes.create.path + `?name=${creatorName}&src=${creatorImg}`}
        className="no-underline"
      >
        <Button
          block
          outline
          size="xs"
          color="primary"
          onClick={() =>
            toggleDrawer({
              creator: { name: creatorName, img: creatorImg },
            })
          }
          {...btnProps}
        >
          Mint
        </Button>
      </Link>
    );
  }

  if (loading || !creatorInfo || !wumboInstance) {
    return <Spinner {...spinnerProps} />;
  }

  return (
    <Link
      to={`${tradePath(creatorInfo.tokenBonding.publicKey)}?name=${creatorInfo.name}`}
      className="no-underline"
    >
      <Button
        block
        size="xs"
        color="secondary"
        onClick={() =>
          toggleDrawer({
            creator: { name: creatorName, img: creatorImg },
          })
        }
        {...btnProps}
      >
        <span className="!text-green-800">${creatorInfo?.coinPriceUsd.toFixed(2)}</span>
      </Button>
    </Link>
  );
};
