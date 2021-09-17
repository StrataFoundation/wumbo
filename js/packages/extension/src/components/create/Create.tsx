import React, { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Button, Avatar } from "@chakra-ui/react";
import { WumboDrawer } from "../WumboDrawer";
import { routes } from "@/constants/routes";
import { useWallet, useQuery } from "wumbo-common";
import ClaimOrCreate from "./ClaimOrCreate";

export const Create = () => {
  const location = useLocation();
  const query = useQuery();
  const { connected, publicKey } = useWallet();
  const currentPath = `${location.pathname}${location.search}`;

  return (
    <Fragment>
      <WumboDrawer.Header title="Create Coin" />
      <WumboDrawer.Content>
        <Box d="flex" bg="gray.100" rounded="lg">
          <Avatar name={query.get("name")!} src={query.get("img")!} />
          <div className="flex justify-between font-medium">
            <span>{query.get("name")!}</span>
            <span>$0.00</span>
          </div>
        </Box>
        <div className="flex justify-center mt-4 text-xs">
          <div className="w-full">
            <span className="font-bold">
              You will be the first to mint & own this person's token!
            </span>{" "}
            It will remain unverified until this person verifies it. Should the
            person opt out, no new tokens may be purchased and exisiting tokens
            may still be sold.
          </div>
        </div>
        <div className="flex mt-4">
          {connected && publicKey ? (
            <ClaimOrCreate />
          ) : (
            <Link
              to={routes.wallet.path + `?redirect=${currentPath}`}
              className="w-full"
            >
              <Button block color="primary" size="lg">
                Connect Wallet
              </Button>
            </Link>
          )}
        </div>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
