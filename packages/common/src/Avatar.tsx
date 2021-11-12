import React from "react";
import {
  VStack,
  Text,
  TextProps,
  Avatar as ChakraAvatar,
  AvatarProps as ChakraAvatarProps,
  Stack,
  StackDirection,
} from "@chakra-ui/react";
import { useErrorHandler, useTokenMetadata } from "@strata-foundation/react";
import { Spinner, ITokenBonding } from "../";

export interface AvatarProps extends ChakraAvatarProps {
  direction?: StackDirection;
  nameProps?: TextProps;
  subText?: string;
  subTextProps?: TextProps;
  showDetails?: boolean;
}

export const Avatar = ({
  name,
  nameProps = {},
  src,
  subText,
  subTextProps = {},
  showDetails,
  size = "md",
  direction = "row",
  ...props
}: AvatarProps) => (
  <Stack direction={direction} spacing={2} alignItems="center">
    <ChakraAvatar size={size} src={src} bgColor="gray.200" {...props} />
    {showDetails && (
      <VStack spacing={2}>
        <Text {...nameProps}>{name}</Text>
        {subText && <Text {...subTextProps}>{subText}</Text>}
      </VStack>
    )}
  </Stack>
);

interface MetadataAvatarProps extends AvatarProps {
  tokenBonding: ITokenBonding | undefined;
}

export const MetadataAvatar = React.memo(
  ({ name, src, tokenBonding, ...props }: MetadataAvatarProps) => {
    const {
      image: metadataImage,
      metadata,
      loading,
      error,
    } = useTokenMetadata(tokenBonding?.targetMint);
    const { handleErrors } = useErrorHandler();

    handleErrors(error);

    if (loading) {
      return <Spinner />;
    }

    return (
      <Avatar
        {...props}
        name={metadata?.data.symbol || name}
        src={metadataImage || src}
      />
    );
  }
);
