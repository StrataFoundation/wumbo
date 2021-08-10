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
        <div className="wum-flex wum-bg-gray-100 wum-p-4 wum-rounded-lg wum-space-x-4">
          <Avatar name={query.get("name")!} imgSrc={query.get("img")!} token />
          <div className="wum-flex wum-flex-col wum-flex-grow wum-justify-center wum-text-gray-700">
            <div className="wum-flex wum-justify-between wum-font-medium">
              <span>{query.get("name")!}</span>
              <span>$0.00</span>
            </div>
          </div>
        </div>
        <div className="wum-flex wum-justify-center wum-mt-4 wum-text-xs">
          <div className="wum-w-full">
            <span className="wum-font-bold">
              You will be the first to mint & own this person's token!
            </span>{" "}
            It will remain unverified until this person verifies it. Should the person opt out, no
            new tokens may be purchased and exisiting tokens may still be sold.
          </div>
        </div>
        <div className="wum-flex wum-mt-4">
          {connected && publicKey ? (
            <ClaimOrCreate />
          ) : (
            <Link to={routes.wallet.path + `?redirect=${currentPath}`} className="wum-w-full">
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
