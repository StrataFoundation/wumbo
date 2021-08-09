import React, { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { WumboDrawer } from "../WumboDrawer";
import { routes } from "@/constants/routes";
import { useWallet, useQuery, Avatar, Button } from "wumbo-common";
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
        <div className="flex bg-gray-100 p-4 rounded-lg space-x-4">
          <Avatar name={query.get("name")!} imgSrc={query.get("img")!} token />
          <div className="flex flex-col flex-grow justify-center text-gray-700">
            <div className="flex justify-between font-medium">
              <span>{query.get("name")!}</span>
              <span>$0.00</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4 text-xs">
          <div className="w-full">
            <span className="font-bold">
              You will be the first to mint & own this person's token!
            </span>{" "}
            It will remain unverified until this person verifies it. Should the person opt out, no
            new tokens may be purchased and exisiting tokens may still be sold.
          </div>
        </div>
        <div className="flex mt-4">
          {connected && publicKey ? (
            <ClaimOrCreate />
          ) : (
            <Link to={routes.wallet.path + `?redirect=${currentPath}`} className="w-full">
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
