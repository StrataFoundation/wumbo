import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { WumboDrawer } from "../WumboDrawer";
import { useDrawer } from "@/contexts/drawerContext";
import { useWallet } from "@/utils/wallet";
import { useAccount } from "@/utils/account";
import { useCreatorInfo } from "@/utils/creatorState";
import { useAssociatedAccount } from "@/utils/walletState";
import { WUM_TOKEN, WUMBO_INSTANCE_KEY } from "@/constants/globals";
import { WumboInstance } from "@/wumbo-api/state";
import { Avatar, CoinDetails, Tabs, Tab, Badge } from "@/components/common";
import { routes } from "@/constants/routes";
import { TokenForm } from "./TokenForm";
import Logo from "../../../public/assets/img/logo.svg";

export const Trade = React.memo(() => {
  const [ownedWUM, setOwnedWUM] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const { state } = useDrawer();
  const { creator } = state;
  const { wallet } = useWallet();
  const connection = useConnection();
  const creatorInfoState = useCreatorInfo(creator.name!);
  const { creatorInfo, loading } = creatorInfoState;
  const { info: wumboInstance } = useAccount(
    WUMBO_INSTANCE_KEY,
    WumboInstance.fromAccount
  );

  const {
    associatedAccount: WUMAccount,
    loading: wumLoading,
  } = useAssociatedAccount(wallet?.publicKey || undefined, WUM_TOKEN);

  useEffect(() => {
    if (WUMAccount) {
      setOwnedWUM((WUMAccount.amount.toNumber() / Math.pow(10, 9)).toFixed(2));
    }
  }, [WUMAccount, setOwnedWUM]);

  const toggleDetails = () => setDetailsVisible(!detailsVisible);

  return (
    <Fragment>
      <WumboDrawer.Header>
        <div className="flex justify-between w-full">
          <p className="text-lg font-medium text-indigo-600">Trade</p>

          <Link to={routes.tradeWUM.path}>
            <Badge rounded hoverable color="primary">
              <Logo width="20" height="20" className="mr-2" />{" "}
              {ownedWUM || "Buy WUM"}
            </Badge>
          </Link>
        </div>
      </WumboDrawer.Header>
      <WumboDrawer.Content>
        <div className="flex bg-gray-100 p-4 rounded-lg space-x-4">
          <Avatar name="NXX2" token />
          <div className="flex flex-col flex-grow justify-center text-gray-700">
            <div className="flex justify-between font-medium">
              <span>@{creator.name}</span>
              <span>${creatorInfo?.coinPriceUsd.toFixed(2) || 0.0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>NXX2</span>
              <span
                className="flex align-center cursor-pointer"
                onClick={toggleDetails}
              >
                Details{" "}
                {!detailsVisible ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronUpIcon className="h-4 w-4" />
                )}
              </span>
            </div>
          </div>
        </div>
        {detailsVisible && (
          <div className="px-2 py-2 mt-4 border-1 border-gray-300 rounded-lg">
            <CoinDetails creatorInfo={creatorInfo} textSize="text-xxs" />
          </div>
        )}
        <div className="flex justify-center mt-4">
          <Tabs>
            <Tab title="Buy">
              <div className="mt-2">
                <span className="text-xxs">
                  Amounts shown in <span className="text-indigo-600">USD</span>
                </span>
                <TokenForm
                  creatorInfoState={creatorInfoState}
                  type="buy"
                  onSubmit={(values) => {
                    console.log(values);
                  }}
                />
                <div className="flex flex-col justify-center mt-4">
                  <span className="flex justify-center text-xxs">
                    You can buy up to 3.34807 NXX2 coins!
                  </span>
                  <div className="flex justify-center mt-4">
                    <Link to={routes.tradeWUM.path}>
                      <Badge rounded hoverable color="primary">
                        <Logo width="20" height="20" className="mr-2" /> Buy WUM
                      </Badge>
                    </Link>
                  </div>
                </div>
              </div>
            </Tab>
            <Tab title="Sell">
              <div className="mt-2">
                <span className="text-xxs">
                  Amounts shown in <span className="text-indigo-600">USD</span>
                </span>
                <TokenForm
                  creatorInfoState={creatorInfoState}
                  type="sell"
                  onSubmit={(values) => {
                    console.log(values);
                  }}
                />
              </div>
            </Tab>
          </Tabs>
        </div>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
});
