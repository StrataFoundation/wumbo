import React from "react";
import { Spinner, useTokenMetadata } from ".";
import { TokenBondingV0 } from "../../spl-token-bonding/dist/lib";
import { classNames } from "./utils/utils";

/*
 ** Basic Avatar
 ** extendable if we need more functionality
 ** https://tailwindui.com/components/application-ui/elements/avatars
 */

interface AvatarProps {
  name?: string;
  subText?: string;
  imgSrc?: string;
  rounded?: boolean;
  token?: boolean;
  showDetails?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

const style = {
  default: `inline-flex items-center justify-center rounded-full bg-gray-500 rounded-md`,
  rounded: "!rounded-full",
  token: "!bg-gradient-to-r !from-yellow-400 !to-red-400",
  sizes: {
    xs: {
      default: "h-8 w-8",
      text: "text-xs font-medium leading-none text-white",
    },
    sm: {
      default: "h-10 w-10",
      text: "text-sm font-medium leading-none text-white",
    },
    md: {
      default: "h-12 w-12",
      text: "font-medium leading-none text-white",
    },
    lg: {
      default: "h-14 w-14",
      text: "text-lg font-medium leading-none text-white",
    },
    xl: {
      default: "h-16 w-16",
      text: "text-xl font-medium leading-none text-white",
    },
  },
};

export const Avatar = ({
  name,
  imgSrc,
  rounded = true,
  token = false,
  size = "md",
}: AvatarProps) => (
  <div className="flex items-center">
    {imgSrc && (
      <img
        src={imgSrc}
        className={classNames(
          style.default,
          rounded && style.rounded,
          style.sizes[size].default
        )}
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
        <span className={style.sizes[size].text}>
          {name && name.substr(0, 2).toUpperCase()}
        </span>
      </span>
    )}
  </div>
);

interface MetadataAvatarProps extends AvatarProps {
  tokenBonding: TokenBondingV0 | undefined;
}
export const MetadataAvatar = React.memo(
  ({ name, imgSrc, tokenBonding, ...props }: MetadataAvatarProps) => {
    const {
      image: metadataImage,
      metadata,
      loading,
    } = useTokenMetadata(tokenBonding?.targetMint);
    if (loading) {
      return <Spinner />;
    }

    return (
      <Avatar
        {...props}
        name={metadata?.data.symbol || name}
        imgSrc={metadataImage || imgSrc}
      />
    );
  }
);
