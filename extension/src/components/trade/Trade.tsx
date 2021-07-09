import React, { Fragment, useState, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { WumboDrawer } from "../WumboDrawer";
import { useDrawer } from "@/contexts/drawerContext";
import { useWallet } from "@/utils/wallet";
import { useAccount } from "@/utils/account";
import { useCreatorInfo } from "@/utils/creatorState";
import { buy, sell } from "@/utils/action";
import { useAssociatedAccount } from "@/utils/walletState";
import {
  BASE_SLIPPAGE,
  WUM_TOKEN,
  WUMBO_INSTANCE_KEY,
} from "@/constants/globals";
import { WumboInstance } from "@/wumbo-api/state";
import { Avatar, CoinDetails, Tabs, Tab, Badge } from "@/components/common";
import { routes } from "@/constants/routes";
import { TokenForm, FormValues } from "./TokenForm";
import Logo from "../../../public/assets/img/logo.svg";
import { usePricing } from "@/utils/pricing";
import { useAsyncCallback } from "react-async-hook";
import { SuccessfulTransaction } from "./SuccessfulTransaction";

export const Trade = React.memo(() => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ownedWUM, setOwnedWUM] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  // TODO: should move this to a context vvv
  const [transactionSuccesful, setTransactionSuccesful] = useState<{
    showing: boolean;
    amount: number;
    tokenSvg?: ReactNode;
    tokenSrc?: string;
    tokenName: string;
  } | null>(null);
  const { state } = useDrawer();
  const { creator } = state;
  const { wallet } = useWallet();
  const connection = useConnection();
  const creatorInfoState = useCreatorInfo(creator.name!);
  const { creatorInfo, loading } = creatorInfoState;
  const { curve, inverseCurve, loading: loadingCurve } = usePricing(
    creatorInfo?.tokenBonding.publicKey
  );
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

  const { execute: onHandleBuy, error: buyError } = useAsyncCallback(
    async (values: FormValues) => {
      setIsSubmitting(true);
      try {
        await buy(wallet)(
          connection,
          creatorInfo!.tokenBonding.publicKey,
          values.tokenAmount,
          curve(values.tokenAmount) + BASE_SLIPPAGE * curve(values.tokenAmount)
        );
        setTransactionSuccesful({
          showing: true,
          amount: values.tokenAmount,
          tokenName: "NXX2",
        });
      } catch (e) {
        console.log(e);
      }
      setIsSubmitting(false);
    }
  );

  // TODO: sell not executing something off with the inverse/slippage
  const { execute: onHandleSell, error: sellError } = useAsyncCallback(
    async (values: FormValues) => {
      setIsSubmitting(true);
      try {
        await sell(wallet)(
          connection,
          creatorInfo!.tokenBonding.publicKey,
          inverseCurve(values.tokenAmount),
          values.tokenAmount - BASE_SLIPPAGE * values.tokenAmount
        );
        setTransactionSuccesful({
          showing: true,
          amount: +(inverseCurve(values.tokenAmount) / Math.pow(10, 9)).toFixed(
            2
          ),
          tokenName: "WUM",
          tokenSvg: <Logo width="45" height="45" />,
        });
      } catch (e) {
        console.log(e);
      }
      setIsSubmitting(false);
    }
  );

  return (
    <Fragment>
      <WumboDrawer.Header>
        <div className="flex justify-between w-full">
          <p className="text-lg font-medium text-indigo-600">Trade</p>

          <Link to={routes.tradeWUM.path}>
            <Badge rounded hoverable color="primary">
              <Logo width="20" height="20" className="mr-2" />{" "}
              {/* TODO: show in fiat terms not token */}
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
          {/* TODO: show owned amount in both tabs */}
          <Tabs>
            <Tab title="Buy">
              <div className="mt-2">
                <span className="text-xxs">
                  Amounts shown in <span className="text-indigo-600">USD</span>
                </span>
                <TokenForm
                  creatorInfoState={creatorInfoState}
                  type="buy"
                  onSubmit={onHandleBuy}
                  submitting={isSubmitting}
                />
                <div className="flex flex-col justify-center mt-4">
                  <span className="flex justify-center text-xxs">
                    You can buy up to{" "}
                    {inverseCurve(ownedWUM ? +ownedWUM : 0).toFixed(4)} NXX2
                    coins!
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
                  onSubmit={onHandleSell}
                  submitting={isSubmitting}
                />
              </div>
            </Tab>
          </Tabs>
        </div>
        <SuccessfulTransaction
          isShowing={transactionSuccesful?.showing || false}
          tokenName={transactionSuccesful?.tokenName}
          tokenSvg={transactionSuccesful?.tokenSvg}
          amount={transactionSuccesful?.amount}
          toggleShowing={() => setTransactionSuccesful(null)}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
});
