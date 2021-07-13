import React, { Fragment, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useConnection } from "@oyster/common";
import { WumboDrawer } from "../WumboDrawer";
import { useDrawer } from "@/contexts/drawerContext";
import {
  WUMBO_INSTANCE_KEY,
  WUMBO_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
  TOKEN_BONDING_PROGRAM_ID,
  SPL_NAME_SERVICE_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
} from "@/constants/globals";
import { WumboInstance } from "@/wumbo-api/state";
import { createWumboCreator } from "@/wumbo-api/bindings";
import { useAccount } from "@/utils/account";
import { useWallet } from "wumbo-common";
import { Avatar, Button, Spinner } from "wumbo-common";
import { routes } from "@/constants/routes";

export const Create = () => {
  const history = useHistory();
  const { state } = useDrawer();
  const { creator } = state;
  const { wallet } = useWallet();
  const connection = useConnection();
  const [creationLoading, setCreationLoading] = useState<boolean>(false);
  const { info: wumboInstance } = useAccount(
    WUMBO_INSTANCE_KEY,
    WumboInstance.fromAccount
  );

  const createCreator = () => {
    setCreationLoading(true);
    createWumboCreator(connection, {
      splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
      splAssociatedTokenAccountProgramId:
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      splTokenProgramId: TOKEN_PROGRAM_ID,
      splWumboProgramId: WUMBO_PROGRAM_ID,
      splNameServicePogramId: SPL_NAME_SERVICE_PROGRAM_ID,
      wumboInstance: WUMBO_INSTANCE_KEY,
      payer: wallet!,
      baseMint: wumboInstance!.wumboMint,
      name: creator.name!,
      founderRewardsPercentage: 5.5,
      nameParent: TWITTER_ROOT_PARENT_REGISTRY_KEY,
    })
      .then(async ({ tokenBondingKey }) => {
        setCreationLoading(false);
        history.push(
          routes.trade.path.replace(
            ":tokenBondingKey",
            tokenBondingKey.toBase58()
          )
        );
      })
      .catch((err) => {
        console.error(err);
        setCreationLoading(false);
      });
  };

  return (
    <Fragment>
      <WumboDrawer.Header title="Create Coin" />
      <WumboDrawer.Content>
        <div className="flex bg-gray-100 p-4 rounded-lg space-x-4">
          <Avatar name={creator.name!} imgSrc={creator.img!} token />
          <div className="flex flex-col flex-grow justify-center text-gray-700">
            <div className="flex justify-between font-medium">
              <span>@{creator.name}</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>6.4M Followers</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4 text-xs">
          <div className="w-full">
            <span className="font-bold">
              You will be the first to mint & own this creators coin!
            </span>{" "}
            It will remain unverified until the creator verifies it. Should the
            creator opt out, no new coins may be purchased and exisiting coins
            may still be sold.
          </div>
        </div>
        <div className="flex mt-4">
          {wallet && wallet.publicKey ? (
            <Button
              block
              color="primary"
              size="lg"
              onClick={createCreator}
              disabled={creationLoading}
            >
              {creationLoading && (
                <div className="mr-4">
                  <Spinner size="sm" />
                </div>
              )}
              Create Coin
            </Button>
          ) : (
            <Link to={routes.wallet.path + `?redirect=${location.pathname}${location.search}`} className="w-full">
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
