import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { WumboDrawer } from "../WumboDrawer";
import Logo from "../../../public/assets/img/logo.svg";
import SolLogo from "../../../public/assets/img/sol.svg";
import { useDrawer } from "@/contexts/drawerContext";
import { useWallet } from "@/utils/wallet";
import { useAccount } from "@/utils/account";
import { useCreatorInfo } from "@/utils/creatorState";
import { buy, sell } from "@/utils/action";
import { WUMBO_INSTANCE_KEY, WUM_BONDING } from "@/constants/globals";
import { WumboInstance } from "@/wumbo-api/state";
import { CoinDetails, Tabs, Tab, Badge } from "@/components/common";
import { routes } from "@/constants/routes";
import { TokenForm, FormValues } from "./TokenForm";
import { usePricing } from "@/utils/pricing";
import { useAsyncCallback } from "react-async-hook";

export const TradeWUM = React.memo(() => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const { state } = useDrawer();
  const { creator } = state;
  const connection = useConnection();
  const { curve, inverseCurve, loading } = usePricing(WUM_BONDING);
  const { wallet, awaitingApproval } = useWallet();
  const creatorInfoState = useCreatorInfo(creator.name!);
  const { creatorInfo, loading: loadingCreatorState } = creatorInfoState;
  const { info: wumboInstance } = useAccount(
    WUMBO_INSTANCE_KEY,
    WumboInstance.fromAccount
  );

  const toggleDetails = () => setDetailsVisible(!detailsVisible);

  const { execute: onHandleBuy, error: buyError } = useAsyncCallback(
    async (values: FormValues) => {
      setIsSubmitting(true);
      console.log("TODO: Buy");
      console.log(curve(20));
      setIsSubmitting(false);
    }
  );

  const { execute: onHandleSell, error: sellError } = useAsyncCallback(
    async (values: FormValues) => {
      setIsSubmitting(true);
      console.log("TODO: Sell");
      console.log(inverseCurve(20));
      setIsSubmitting(false);
    }
  );

  return (
    <Fragment>
      <WumboDrawer.Header>
        <div className="flex justify-between w-full">
          <p className="text-lg font-medium text-indigo-600">Trade WUM</p>
          <Link to={routes.tradeWUM.path}>
            <Badge rounded hoverable color="neutral">
              <SolLogo width="20" height="20" className="mr-2" /> Buy SOL
            </Badge>
          </Link>
        </div>
      </WumboDrawer.Header>
      <WumboDrawer.Content>
        <div className="flex bg-gray-100 p-4 rounded-lg space-x-4">
          <Logo width="45" height="45" />
          <div className="flex flex-col flex-grow justify-center text-gray-700">
            <div className="flex justify-between font-medium">
              <span>Wum.bo</span>
              <span>${creatorInfo?.coinPriceUsd.toFixed(2) || 0.0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>WUM</span>
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
                  isWUM
                  creatorInfoState={creatorInfoState}
                  type="buy"
                  onSubmit={onHandleBuy}
                  submitting={isSubmitting}
                />
                <div className="flex flex-col justify-center mt-4">
                  <span className="flex justify-center text-xxs">
                    You can buy up to 3.34807 WUM coins!
                  </span>
                  <div className="flex justify-center mt-4">
                    <Link to={routes.tradeWUM.path}>
                      <Badge rounded hoverable color="neutral">
                        <SolLogo width="20" height="20" className="mr-2" /> Buy
                        SOL
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
                  isWUM
                  creatorInfoState={creatorInfoState}
                  type="sell"
                  onSubmit={onHandleSell}
                  submitting={isSubmitting}
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
