import React from "react";
import { Link as PlainLink } from "@chakra-ui/react";
import { Metadata as MetaplexMetadata } from "@strata-foundation/spl-utils";
import {
  useSocialTokenMetadata,
  useErrorHandler,
} from "@strata-foundation/react";
import { ITokenRef } from "@strata-foundation/spl-token-collective";
import { Link } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { Avatar, truncatePubkey, useReverseTwitter } from "../";

export type GetCreatorLink = (
  c: PublicKey,
  t: MetaplexMetadata | undefined,
  b: ITokenRef | undefined,
  h: string | undefined
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

    const  { handle, error: reverseTwitterError2 } =
      useReverseTwitter(creator);
    handleErrors(error, reverseTwitterError2);

    const children = (
      <>
        {metadata && (
          <Avatar showDetails size="xs" src={image} name={metadata.data.name} />
        )}
        {!metadata && !handle && truncatePubkey(creator)}
        { handle && `@${handle}`}
      </>
    );

    // @ts-ignore
    const link = getCreatorLink(creator, metadata, tokenRef, handle);

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
