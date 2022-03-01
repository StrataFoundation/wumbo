import { routes, viewProfilePath } from "@/constants/routes";
import { useDrawer } from "@/contexts/drawerContext";
import { Link, Button, ButtonProps, SpinnerProps } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useErrorHandler, useTokenRefForName } from "@strata-foundation/react";
import React, { FC } from "react";
import {
  PriceButton,
  SITE_URL,
  Spinner,
  useReverseTwitter,
  useTwitterTld,
} from "wumbo-common";

type Props = {
  creatorName: string;
  creatorImg: string;
  btnProps?: ButtonProps;
  spinnerProps?: SpinnerProps;
  buttonTarget?: HTMLElement;
};

export const ClaimButton: FC<Props> = ({
  creatorName,
  creatorImg,
  btnProps = {},
  spinnerProps = {},
  buttonTarget,
}: Props) => {
  const { toggleDrawer } = useDrawer();
  const tld = useTwitterTld();
  const { info: tokenRef, loading } = useTokenRefForName(
    creatorName,
    null,
    tld
  );

  const { publicKey, connected } = useWallet();
  const { handle: ownerTwitterHandle, error: reverseTwitterError } =
    useReverseTwitter(publicKey || undefined);
  const { handleErrors } = useErrorHandler();

  if (loading) {
    return <Spinner size="sm" {...spinnerProps} />;
  }

  if (
    !loading &&
    !tokenRef?.isClaimed &&
    (!ownerTwitterHandle || ownerTwitterHandle == creatorName)
  ) {
    return (
      <Button
        as={Link}
        isExternal
        href={SITE_URL + "/app/claim?handle=" + creatorName}
        size="xs"
        fontFamily="body"
        colorScheme="twitter"
        variant="outline"
        _hover={{ bg: "indigo.900" }}
        _active={{ bg: "indigo.900" }}
        _focus={{ boxShadow: "none" }}
        {...btnProps}
      >
        Claim
      </Button>
    );
  }

  if (!tokenRef) {
    return null;
  }

  return (
    <PriceButton
      optedOut={tokenRef?.isOptedOut as boolean}
      buttonTarget={buttonTarget}
      {...(btnProps as any)}
      r={100}
      h={"36px"}
      link={`${viewProfilePath(tokenRef.mint)}?name=${creatorName}`}
      onClick={() =>
        toggleDrawer({
          isOpen: true,
          creator: { name: creatorName, img: creatorImg },
        })
      }
      tokenBonding={tokenRef.tokenBonding}
      mint={tokenRef.mint}
    />
  );
};
