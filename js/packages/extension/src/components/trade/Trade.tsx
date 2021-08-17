import React, { Fragment, useState, ReactNode, useMemo } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useBuy, useSell } from "@/utils/action";
import {
  useClaimedTokenRef,
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
  Notification,
  useTokenMetadata,
  MetadataAvatar,
  useFtxPayLink,
} from "wumbo-common";
import { routes, viewProfilePath } from "@/constants/routes";
import { TokenForm, FormValues } from "./TokenForm";
import { CashIcon } from "@heroicons/react/solid";
import Logo from "../../../public/assets/img/logo.svg";
import { PublicKey } from "@solana/web3.js";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import SolLogo from "../../../public/assets/img/sol.svg";
import { WumboDrawer } from "../WumboDrawer";

interface TokenInfo {
  name?: string;
  ticker?: string;
  icon: React.ReactElement;
  loading: boolean;
  error: Error | undefined;
}
function useTokenInfo(tokenBonding: TokenBondingV0 | undefined): TokenInfo {
  const query = useQuery();
  const { metadata, image, error, loading } = useTokenMetadata(tokenBonding?.targetMint);

  return useMemo(() => {
    if (tokenBonding) {
      if (tokenBonding.targetMint.toBase58() == WUM_TOKEN.toBase58()) {
        return {
          loading,
          error,
          ticker: "WUM",
          icon: <Logo width="45" height="45" />,
          name: "WUM",
        };
      } else if (metadata) {
        return {
          loading,
          error,
          ticker: metadata.data.symbol,
          icon: <MetadataAvatar token tokenBonding={tokenBonding} name={"UNCLAIMED"} />,
          name: metadata.data.name,
        };
      } else if (!loading) {
        const name = metadata?.data?.name || "UNCLAIMED";
        return {
          loading,
          error,
          ticker: "UNCLAIMED",
          icon: <Avatar token imgSrc={image} name={name} />,
          name: query.get("name") || undefined,
        };
      }
    }

    return {
      loading,
      error,
      icon: <Spinner />,
    };
  }, [metadata, loading, query.get("name"), error]);
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

export const TradeRoute = () => {
  const { connected } = useWallet();
  const params = useParams<{ tokenBondingKey: string }>();
  const tokenBondingKey = new PublicKey(params.tokenBondingKey);
  const { info: tokenBonding } = useAccount(tokenBondingKey, TokenBondingV0.fromAccount);
  const info = useTokenInfo(tokenBonding);
  const { name, ticker, icon, loading } = info;
  const ownedWUM = useOwnedAmount(WUM_TOKEN);
  const fiatPrice = useFiatPrice(tokenBonding?.baseMint);
  const toFiat = (a: number) => (fiatPrice || 0) * a;
  const ftxPayLink = useFtxPayLink();
  const location = useLocation();

  if (!tokenBonding || !name || !icon) {
    return <WumboDrawer.Loading />;
  }

  const isTargetWUM = tokenBonding.targetMint.toBase58() == WUM_TOKEN.toBase58();
  const buyBaseLink = (showFiat = true) => {
    if (!connected) {
      return (
        <Link to={routes.wallet.path + `?redirect=${location.pathname}${location.search}`}>
          <Badge rounded hoverable color="neutral">
            <CashIcon width="20" height="20" className="mr-2" /> Connect Wallet
          </Badge>
        </Link>
      );
    } else if (isTargetWUM) {
      return (
        <Link target="_blank" to={{ pathname: ftxPayLink }}>
          <Badge rounded hoverable color="neutral">
            <SolLogo width="20" height="20" className="mr-2" /> Buy SOL
          </Badge>
        </Link>
      );
    } else {
      return (
        <Link to={routes.trade.path.replace(":tokenBondingKey", WUM_BONDING.toBase58())}>
          <Badge rounded hoverable color="primary">
            <Logo width="20" height="20" className="mr-2" />
            {showFiat && "$"}
            {(showFiat && toFiat(ownedWUM || 0).toFixed(2)) || "Buy WUM"}
          </Badge>
        </Link>
      );
    }
  };

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
            isTargetWUM ? <SolLogo width="45" height="45" /> : <Logo width="45" height="45" />
          }
          ticker={isTargetWUM ? "WUM" : ticker || ""}
          name={name}
          tokenBonding={tokenBonding}
          icon={icon}
          buyBaseLink={buyBaseLink}
        />
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};

export const Trade = ({
  baseTicker,
  baseIcon,
  name,
  icon,
  ticker,
  buyBaseLink,
  tokenBonding,
}: TradeParams) => {
  const [buy, { loading: buyIsSubmitting, error: buyError }] = useBuy();
  const [sell, { loading: sellIsSubmitting, error: sellError }] = useSell();
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
  const location = useLocation();

  const onHandleBuy = async (values: FormValues) => {
    const maxAmount =
      baseToTargetPrice(values.tokenAmount) + BASE_SLIPPAGE * baseToTargetPrice(values.tokenAmount);
    await buy(tokenBonding.publicKey, values.tokenAmount, maxAmount);
    toast.custom((t) => (
      <Notification
        className="rounded-b-lg"
        show={t.visible}
        type="success"
        heading="Transaction Succesful"
        message={`You now own ${Number(values.tokenAmount).toFixed(4)} of ${ticker}!`}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ));
  };

  const onHandleSell = async (values: FormValues) => {
    const minPrice =
      sellTargetToBasePrice(values.tokenAmount) -
      BASE_SLIPPAGE * sellTargetToBasePrice(values.tokenAmount);
    await sell(tokenBonding.publicKey, values.tokenAmount, minPrice);

    toast.custom((t) => (
      <Notification
        className="rounded-b-lg"
        show={t.visible}
        type="success"
        heading="Transaction Succesful"
        message={`You now own ${sellTargetToBasePrice(values.tokenAmount).toFixed(
          4
        )} of ${baseTicker}!`}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ));
  };

  const Info = (
    <Fragment>
      <span className="text-xxs">
        Amounts shown in <span className="text-indigo-600">USD</span>
      </span>
      <div className="text-xxs w-full text-right">Own: {(ownedTarget || 0).toFixed(4)}</div>
    </Fragment>
  );

  return (
    <Fragment>
      <TokenPill
        tokenBonding={tokenBonding}
        name={name}
        ticker={ticker}
        icon={icon}
        detailsPath={viewProfilePath(tokenBonding.publicKey) + location.search}
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
                  You can buy up to {baseToTargetPrice(ownedBase || 0).toFixed(4)} {ticker} coins!
                </span>
                <div className="flex justify-center mt-4">{buyBaseLink(false)}</div>
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
    </Fragment>
  );
};
