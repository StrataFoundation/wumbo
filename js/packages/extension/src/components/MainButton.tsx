import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonProps } from "@chakra-ui/react";
import { useUserInfo } from "@/utils/userState";
import {
  Spinner,
  ISpinnerProps,
  WUMBO_INSTANCE_KEY,
  WumboInstance,
  useAccount,
} from "wumbo-common";
import { useDrawer } from "@/contexts/drawerContext";
import { routes, tradePath, viewProfilePath } from "@/constants/routes";

type Props = {
  creatorName: string;
  creatorImg: string;
  btnProps?: ButtonProps;
  spinnerProps?: ISpinnerProps;
};

export const MainButton: FC<Props> = ({
  creatorName,
  creatorImg,
  btnProps = {},
  spinnerProps = {},
}: Props) => {
  const { toggleDrawer } = useDrawer();
  const creatorInfoState = useUserInfo(creatorName);
  const { userInfo: creatorInfo, loading } = creatorInfoState;
  const { info: wumboInstance } = useAccount(
    WUMBO_INSTANCE_KEY,
    WumboInstance,
    true
  );

  if (!loading && !creatorInfo && wumboInstance) {
    return (
      <Link to={routes.create.path + `?name=${creatorName}&src=${creatorImg}`}>
        <Button
          size="xs"
          fontFamily="body"
          colorScheme="indigo"
          variant="outline"
          _focus={{ boxShadow: "none" }}
          onClick={() =>
            toggleDrawer({
              isOpen: true,
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
    return <Spinner size="sm" {...spinnerProps} />;
  }

  return (
    <Link
      to={`${viewProfilePath(creatorInfo.tokenRef.publicKey)}?name=${
        creatorInfo.name
      }`}
    >
      <Button
        size="xs"
        colorScheme="green"
        color="green.800"
        fontFamily="body"
        onClick={() =>
          toggleDrawer({
            isOpen: true,
            creator: { name: creatorName, img: creatorImg },
          })
        }
        {...btnProps}
      >
        ${creatorInfo?.coinPriceUsd.toFixed(2)}
      </Button>
    </Link>
  );
};
