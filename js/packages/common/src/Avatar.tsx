import React from "react";
import { Spinner, useTokenMetadata } from ".";
import { TokenBondingV0 } from "../../spl-token-bonding/dist/lib";
import { classNames } from "./utils/utils";

/*
 ** Basic Avatar
 ** extendable if we need more functionality
 ** https://tailwindui.com/components/application-ui/elements/avatars
 */

export interface IAvatarProps {
  name?: string;
  subText?: string;
  imgSrc?: string;
  rounded?: boolean;
  token?: boolean;
  showDetails?: boolean;
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
}

const style = {
  default: `wum-inline-flex wum-items-center wum-justify-center wum-rounded-full wum-bg-gray-500 wum-rounded-md`,
  rounded: "!wum-rounded-full",
  token: "!wum-bg-gradient-to-r !wum-from-yellow-400 !wum-to-red-400",
  sizes: {
    xxs: {
      default: "wum-h-6 wum-w-6",
      text: "wum-text-xxs wum-font-medium wum-leading-none wum-text-white",
    },
    xs: {
      default: "wum-h-8 wum-w-8",
      text: "wum-text-xs wum-font-medium wum-leading-none wum-text-white",
    },
    sm: {
      default: "wum-h-10 wum-w-10",
      text: "wum-text-sm wum-font-medium wum-leading-none wum-text-white",
    },
    md: {
      default: "wum-h-12 wum-w-12",
      text: "wum-font-medium wum-leading-none wum-text-white",
    },
    lg: {
      default: "wum-h-14 wum-w-14",
      text: "wum-text-lg wum-font-medium wum-leading-none wum-text-white",
    },
    xl: {
      default: "wum-h-16 wum-w-16",
      text: "wum-text-xl wum-font-medium wum-leading-none wum-text-white",
    },
  },
};

export const Avatar = ({
  name,
  imgSrc,
  subText,
  showDetails,
  rounded = true,
  token = false,
  size = "md",
}: IAvatarProps) => (
  <div className="wum-flex wum-items-center">
    {imgSrc && (
      <img
        src={imgSrc}
        className={classNames(style.default, rounded && style.rounded, style.sizes[size].default)}
      />
    )}
    {!imgSrc && (
      <span
        className={classNames(
          style.default,
          rounded && style.rounded,
          token && style.token,
          style.sizes[size].default
        )}
      >
        <span className={style.sizes[size].text}>{name && name.substr(0, 2).toUpperCase()}</span>
      </span>
    )}
    {showDetails && (
      <div className="wum-ml-3">
        <p className="wum-font-medium wum-text-gray-700">{name}</p>
        {subText && <p className="wum-text-xs wum-font-medium wum-text-gray-700">{subText}</p>}
      </div>
    )}
  </div>
);

interface MetadataAvatarProps extends IAvatarProps {
  tokenBonding: TokenBondingV0 | undefined;
}
export const MetadataAvatar = React.memo(
  ({ name, imgSrc, tokenBonding, ...props }: MetadataAvatarProps) => {
    const { image: metadataImage, metadata, loading } = useTokenMetadata(tokenBonding?.targetMint);
    if (loading) {
      return <Spinner />;
    }

    return (
      <Avatar {...props} name={metadata?.data.symbol || name} imgSrc={metadataImage || imgSrc} />
    );
  }
);
