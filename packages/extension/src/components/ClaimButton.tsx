import React, { FC } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, ButtonProps, SpinnerProps } from "@chakra-ui/react";
import { useUserInfo } from "@/utils/userState";
import { Spinner, useReverseTwitter } from "wumbo-common";
import { useErrorHandler } from "@strata-foundation/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDrawer } from "@/contexts/drawerContext";
import { routes, viewProfilePath } from "@/constants/routes";
import { useClaimFlow } from "@/utils/claim";

type Props = {
  creatorName: string;
  creatorImg: string;
  btnProps?: ButtonProps;
  spinnerProps?: SpinnerProps;
};

export const ClaimButton: FC<Props> = ({
  creatorName,
  creatorImg,
  btnProps = {},
  spinnerProps = {},
}: Props) => {
  const { toggleDrawer } = useDrawer();
  const creatorInfoState = useUserInfo(creatorName);
  const { userInfo: creatorInfo, loading } = creatorInfoState;
  const {
    claim,
    loading: loadingClaim,
    error: claimError,
  } = useClaimFlow(creatorName);
  const { publicKey, connected } = useWallet();
  const { handle: ownerTwitterHandle, error: reverseTwitterError } =
    useReverseTwitter(publicKey || undefined);
  const { handleErrors } = useErrorHandler();
  handleErrors(claimError);

  if (loading || loadingClaim) {
    return <Spinner size="sm" {...spinnerProps} />;
  }

  if (
    !loading &&
    !creatorInfo?.tokenRef.isClaimed &&
    (!ownerTwitterHandle || ownerTwitterHandle == creatorName)
  ) {
    return (
      <Button
        as={Link}
        to={routes.create.path + `?name=${creatorName}&src=${creatorImg}`}
        size="xs"
        fontFamily="body"
        colorScheme="twitter"
        variant="outline"
        _hover={{ bg: "indigo.900" }}
        _active={{ bg: "indigo.900" }}
        _focus={{ boxShadow: "none" }}
        onClick={() => {
          toggleDrawer({
            isOpen: true,
            creator: { name: creatorName, img: creatorImg },
          });
          connected && claim();
        }}
        {...btnProps}
      >
        Claim
      </Button>
    );
  }

  if (!creatorInfo) {
    return null;
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
