import React, { Fragment, useState, ReactNode, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useConnection, Wallet } from "@oyster/common";
import { buy, sell } from "@/utils/action";
import {
  BASE_SLIPPAGE,
  WUM_BONDING,
  WUM_TOKEN,
  useAccount,
  useWallet,
  useFiatPrice,
  useBondingPricing,
  useOwnedAmount,
  useQuery,
  Tabs,
  Tab,
  Badge,
  Spinner,
  Avatar,
  TokenPill,
} from "wumbo-common";
import { routes } from "@/constants/routes";
import { TokenForm, FormValues } from "./TokenForm";
import Logo from "../../../public/assets/img/logo.svg";
import { useAsyncCallback } from "react-async-hook";
import { SuccessfulTransaction } from "./SuccessfulTransaction";
import { PublicKey } from "@solana/web3.js";
import { TokenBondingV0 } from "spl-token-bonding";
import SolLogo from "../../../public/assets/img/sol.svg";
import { WumboDrawer } from "../WumboDrawer";

function useName(tokenBonding: TokenBondingV0 | undefined): string | undefined {
  const query = useQuery();
  const [name, setName] = useState<string>();

  useEffect(() => {
    if (tokenBonding) {
      if (tokenBonding.targetMint.toBase58() == WUM_TOKEN.toBase58()) {
        setName("WUM");
      } else {
        setName(query.get("name") || undefined);
      }
    }
  }, [query.get("name"), tokenBonding]);

  return name;
}

function useImage(
  tokenBonding: TokenBondingV0 | undefined
): React.ReactElement {
  const query = useQuery();
  const [icon, setIcon] = useState<React.ReactElement>(<div />);

  useEffect(() => {
    if (tokenBonding) {
      if (tokenBonding.targetMint.toBase58() == WUM_TOKEN.toBase58()) {
        setIcon(<Logo width="45" height="45" />);
      } else {
        setIcon(<Avatar name="UNCLAIMED" />);
      }
    }
  }, [tokenBonding]);

  return icon;
}

interface TradeParams {
  tokenBonding: TokenBondingV0;
  name: string;
  ticker: string;
  icon: React.ReactElement;
  baseTicker: string;
  baseIcon: React.ReactElement;
  buyBaseLink: (arg0: boolean) => React.ReactElement;
}

export const TradeRoute = React.memo(() => {
  const params = useParams<{ tokenBondingKey: string }>();
  const tokenBondingKey = new PublicKey(params.tokenBondingKey);
  const { info: tokenBonding } = useAccount(
    tokenBondingKey,
    TokenBondingV0.fromAccount
  );
  const name = useName(tokenBonding);
  const icon = useImage(tokenBonding);
  const ownedWUM = useOwnedAmount(WUM_TOKEN);
  const fiatPrice = useFiatPrice(tokenBonding?.baseMint);
  const toFiat = (a: number) => (fiatPrice || 0) * a;

  if (!tokenBonding || !name || !icon) {
    return <WumboDrawer.Loading />;
  }

  const isTargetWUM =
    tokenBonding.targetMint.toBase58() == WUM_TOKEN.toBase58();
  const buyBaseLink = (showFiat = true) =>
    isTargetWUM ? (
      <Link to={"/undefined"}>
        <Badge rounded hoverable color="neutral">
          <SolLogo width="20" height="20" className="mr-2" /> Buy SOL
        </Badge>
      </Link>
    ) : (
      <Link
        to={routes.trade.path.replace(
          ":tokenBondingKey",
          WUM_BONDING.toBase58()
        )}
      >
        <Badge rounded hoverable color="primary">
          <Logo width="20" height="20" className="mr-2" />
          {showFiat && "$"}
          {(showFiat && toFiat(ownedWUM || 0).toFixed(2)) || "Buy WUM"}
        </Badge>
      </Link>
    );

  return (
    <Fragment>
      <WumboDrawer.Header>
        <div className="flex justify-between w-full">
          <p className="text-lg font-medium text-indigo-600">Trade WUM</p>
          {/* TODO: link to ftx pay */}
          {buyBaseLink()}
        </div>
      </WumboDrawer.Header>
      <WumboDrawer.Content>
        <Trade
          baseTicker={isTargetWUM ? "SOL" : "WUM"}
          baseIcon={
            isTargetWUM ? (
              <SolLogo width="45" height="45" />
            ) : (
              <Logo width="45" height="45" />
            )
          }
          ticker={isTargetWUM ? "WUM" : "UNCLAIMED"}
          name={name}
          tokenBonding={tokenBonding}
          icon={icon}
          buyBaseLink={buyBaseLink}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
});

export const Trade = React.memo(
  ({
    baseTicker,
    baseIcon,
    name,
    icon,
    ticker,
    buyBaseLink,
    tokenBonding,
  }: TradeParams) => {
    // TODO: should move this to a context vvv
    const [transactionSuccesful, setTransactionSuccesful] = useState<{
      showing: boolean;
      amount: number;
      tokenSvg?: ReactNode;
      tokenSrc?: string;
      tokenName: string;
    } | null>(null);
    const { wallet } = useWallet();
    const connection = useConnection();
    const {
      targetToBasePrice,
      baseToTargetPrice,
      sellTargetToBasePrice,
      sellBaseToTargetPrice,
    } = useBondingPricing(tokenBonding.publicKey);
    const fiatPrice = useFiatPrice(tokenBonding.baseMint);
    const toFiat = (a: number) => (fiatPrice || 0) * a;
    const fromFiat = (a: number) => a / (fiatPrice || 0);

    const ownedBase = useOwnedAmount(tokenBonding.baseMint);
    const ownedTarget = useOwnedAmount(tokenBonding.targetMint);

    const {
      execute: onHandleBuy,
      error: buyError,
      loading: buyIsSubmitting,
    } = useAsyncCallback(async (values: FormValues) => {
      try {
        await buy(wallet)(
          connection,
          tokenBonding.publicKey,
          values.tokenAmount,
          baseToTargetPrice(values.tokenAmount) +
            BASE_SLIPPAGE * baseToTargetPrice(values.tokenAmount)
        );
        setTransactionSuccesful({
          showing: true,
          amount: values.tokenAmount,
          tokenName: ticker,
        });
      } catch (e) {
        console.error(e);
      }
    });

    const {
      execute: onHandleSell,
      error: sellError,
      loading: sellIsSubmitting,
    } = useAsyncCallback(async (values: FormValues) => {
      try {
        const minPrice =
          sellTargetToBasePrice(values.tokenAmount) -
          BASE_SLIPPAGE * sellTargetToBasePrice(values.tokenAmount);
        console.log(`Selling ${values.tokenAmount} with min ${minPrice}`);
        await sell(wallet)(
          connection,
          tokenBonding.publicKey,
          values.tokenAmount,
          minPrice
        );
        setTransactionSuccesful({
          showing: true,
          amount: sellTargetToBasePrice(values.tokenAmount),
          tokenName: baseTicker,
          tokenSvg: baseIcon,
        });
      } catch (e) {
        console.log(e);
      }
    });

    const Info = (
      <Fragment>
        <span className="text-xxs">
          Amounts shown in <span className="text-indigo-600">USD</span>
        </span>
        <div className="text-xxs w-full text-right">
          Own: {(ownedTarget || 0).toFixed(4)}
        </div>
      </Fragment>
    );

    return (
      <Fragment>
        <TokenPill
          tokenBonding={tokenBonding}
          name={name}
          icon={icon}
          ticker={ticker}
        />
        <div className="flex justify-center mt-4">
          {/* TODO: show owned amount in both tabs */}
          <Tabs>
            <Tab title="Buy">
              <div className="mt-2">
                {Info}
                <TokenForm
                  fiatAmountFromTokenAmount={(tokenAmount: number) =>
                    toFiat(targetToBasePrice(tokenAmount))
                  }
                  tokenAmountFromFiatAmount={(fiatAmount: number) =>
                    baseToTargetPrice(fromFiat(fiatAmount))
                  }
                  icon={icon}
                  ticker={ticker}
                  type="buy"
                  onSubmit={onHandleBuy}
                  submitting={buyIsSubmitting}
                />
                <div className="flex flex-col justify-center mt-4">
                  <span className="flex justify-center text-xxs">
                    You can buy up to{" "}
                    {baseToTargetPrice(ownedBase || 0).toFixed(4)} {ticker}{" "}
                    coins!
                  </span>
                  <div className="flex justify-center mt-4">
                    {buyBaseLink(false)}
                  </div>
                </div>
              </div>
            </Tab>
            <Tab title="Sell">
              <div className="mt-2">
                {Info}
                <TokenForm
                  fiatAmountFromTokenAmount={(fiatAmount: number) =>
                    toFiat(sellTargetToBasePrice(fiatAmount))
                  }
                  tokenAmountFromFiatAmount={(tokenAmount: number) =>
                    sellBaseToTargetPrice(fromFiat(tokenAmount))
                  }
                  icon={icon}
                  ticker={ticker}
                  type="sell"
                  onSubmit={onHandleSell}
                  submitting={sellIsSubmitting}
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
      </Fragment>
    );
  }
);
