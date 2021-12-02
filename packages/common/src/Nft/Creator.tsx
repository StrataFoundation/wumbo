import React from "react";
import { Link as PlainLink } from "@chakra-ui/react";
import { Metadata as MetaplexMetadata } from "@oyster/common";
import {
  useSocialTokenMetadata,
  useErrorHandler,
} from "@strata-foundation/react";
import { ITokenRef } from "@strata-foundation/spl-token-collective";
import { Link } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { Avatar } from "../";

export type GetCreatorLink = (
  c: PublicKey,
  t: MetaplexMetadata | undefined,
  b: ITokenRef | undefined
) => string;

export const Creator = React.memo(
  ({
    creator,
    getCreatorLink,
  }: {
    creator: PublicKey;
    getCreatorLink: GetCreatorLink;
  }) => {
    const { handleErrors } = useErrorHandler();
    const { metadata, tokenRef, error, image } =
      useSocialTokenMetadata(creator);

    handleErrors(error);

    const truncatePubkey = (pkey: PublicKey): string => {
      const pkeyStr = pkey.toString();

      return `${pkeyStr.substr(0, 4)}...${pkeyStr.substr(pkeyStr.length - 4)}`;
    };

    const children = (
      <>
        {metadata && (
          <Avatar showDetails size="xs" src={image} name={metadata.data.name} />
        )}
        {!metadata && truncatePubkey(creator)}
      </>
    );

    // @ts-ignore
    const link = getCreatorLink(creator, metadata, tokenRef);

    if (link.includes("http")) {
      return (
        <PlainLink ml="1" mr="1" href={link}>
          {children}
        </PlainLink>
      );
    }

    return <Link to={link}>{children}</Link>;
  }
);
