import React from "react";
import {
  HStack,
  VStack,
  Text,
  TextProps,
  Avatar as ChakraAvatar,
  AvatarProps as ChakraAvatarProps,
} from "@chakra-ui/react";
import { Spinner, useTokenMetadata } from ".";
import { handleErrors } from "./contexts";
import { ITokenBonding } from "utils";

export interface AvatarProps extends ChakraAvatarProps {
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
  ...props
}: AvatarProps) => (
  <HStack spacing={2} alignItems="center">
    <ChakraAvatar size={size} src={src} bgColor="gray.200" {...props} />
    {showDetails && (
      <VStack spacing={2}>
        <Text {...nameProps}>{name}</Text>
        {subText && <Text {...subTextProps}>{subText}</Text>}
      </VStack>
    )}
  </HStack>
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
