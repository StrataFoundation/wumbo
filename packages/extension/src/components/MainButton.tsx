import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonProps, SpinnerProps } from "@chakra-ui/react";
import { useUserInfo } from "@/utils/userState";
import {
  Spinner
} from "wumbo-common";
import { useDrawer } from "@/contexts/drawerContext";
import { routes, viewProfilePath } from "@/constants/routes";

type Props = {
  creatorName: string;
  creatorImg: string;
  btnProps?: ButtonProps;
  spinnerProps?: SpinnerProps;
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

  if (!loading && !creatorInfo) {
    return (
      <Button
        as={Link}
        to={routes.create.path + `?name=${creatorName}&src=${creatorImg}`}
        size="xs"
        fontFamily="body"
        colorScheme="indigo"
        variant="outline"
        _hover={{ bg: "indigo.900" }}
        _active={{ bg: "indigo.900" }}
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
    );
  }

  if (loading || !creatorInfo) {
    return <Spinner size="sm" {...spinnerProps} />;
  }

  return (
    <Button
      as={Link}
      to={`${viewProfilePath(creatorInfo.tokenRef.publicKey)}?name=${
        creatorInfo.name
      }`}
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
  );
};
