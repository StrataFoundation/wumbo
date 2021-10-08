import React, { Fragment, useState, ReactNode, useMemo } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  VStack,
  Flex,
  Text,
  Button,
  Avatar,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Icon,
} from "@chakra-ui/react";
import { RiWallet3Line } from "react-icons/ri";
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
  TokenPill,
  Spinner,
  Notification,
  useTokenMetadata,
  MetadataAvatar,
  useFtxPayLink,
  TokenBonding,
  ITokenBonding,
  useTokenRefFromBonding,
  handleErrors,
  useSolOwnedAmount,
  SOL_TOKEN,
  amountAsNum,
  useMint,
} from "wumbo-common";
import { routes, viewProfilePath } from "@/constants/routes";
import { TokenForm, FormValues } from "./TokenForm";
import Logo from "../../../public/assets/img/logo.svg";
import { PublicKey } from "@solana/web3.js";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import SolLogo from "../../../public/assets/img/sol.svg";
import { WumboDrawer } from "../WumboDrawer";
import { u64 } from "@solana/spl-token";

interface TokenInfo {
  name?: string;
  ticker?: string;
  icon: React.ReactElement;
  loading: boolean;
  error: Error | undefined;
}
function useTokenInfo(tokenBonding: TokenBondingV0 | undefined): TokenInfo {
  const query = useQuery();
  const { metadata, image, error, metadataKey, loading } = useTokenMetadata(
    tokenBonding?.targetMint
  );

  return useMemo(() => {
    if (tokenBonding) {
      if (metadata) {
        return {
          loading,
          error,
          ticker: metadata.data.symbol,
          icon: (
            <MetadataAvatar tokenBonding={tokenBonding} name={"UNCLAIMED"} />
          ),
          name: metadata.data.name,
        };
      } else if (!loading) {
        const name = metadata?.data?.name || "UNCLAIMED";
        return {
          loading,
          error,
          ticker: "UNCLAIMED",
          icon: <Avatar src={image} name={name} />,
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
  tokenBonding: ITokenBonding;
  name: string;
  ticker: string;
  icon: React.ReactElement;
  baseTicker: string;
  baseIcon?: React.ReactElement;
  buyBaseLink: (arg0: boolean) => React.ReactElement;
}

export const TradeRoute = () => {
  const { connected } = useWallet();
  const params = useParams<{ tokenBondingKey: string }>();
  const tokenBondingKey = new PublicKey(params.tokenBondingKey);
  const { info: tokenBonding } = useAccount(tokenBondingKey, TokenBonding);
  const info = useTokenInfo(tokenBonding);
  const { name, ticker, icon, error: tokenInfoError } = info;
  const ownedWUM = useOwnedAmount(WUM_TOKEN);
  const fiatPrice = useFiatPrice(tokenBonding?.baseMint);
  const toFiat = (a: number) => (fiatPrice || 0) * a;
  const ftxPayLink = useFtxPayLink();
  const location = useLocation();
  const { curve } = useBondingPricing(tokenBonding?.publicKey);

  handleErrors(tokenInfoError);

  if (!tokenBonding || !name || !icon || !curve) {
    return <WumboDrawer.Loading />;
  }

  const isTargetWUM =
    tokenBonding.targetMint.toBase58() == WUM_TOKEN.toBase58();

  const buyBaseLink = (showFiat = true) => {
    if (!connected) {
      return (
        <Button
          as={Link}
          to={
            routes.manageWallet.path +
            `?redirect=${location.pathname}${location.search}`
          }
          size="xs"
          leftIcon={<Icon as={RiWallet3Line} w={5} h={5} />}
          colorScheme="gray"
          rounded="full"
        >
          <Text fontSize="xs">Connect Wallet</Text>
        </Button>
      );
    } else if (isTargetWUM) {
      return (
        <Button
          as={Link}
          to={{ pathname: ftxPayLink }}
          target="_blank"
          size="sm"
          leftIcon={<Icon as={SolLogo} w={5} h={5} />}
          colorScheme="gray"
          rounded="full"
        >
          <Text fontSize="xs">Buy SOL</Text>
        </Button>
      );
    } else {
      return (
        <Button
          as={Link}
          to={routes.trade.path.replace(
            ":tokenBondingKey",
            WUM_BONDING.toBase58()
          )}
          size="sm"
          leftIcon={<Icon as={Logo} w={5} h={5} />}
          colorScheme="gray"
          rounded="full"
        >
          <Text fontSize="xs">
            {showFiat && "$"}
            {(showFiat && toFiat(ownedWUM || 0).toFixed(2)) || "Buy WUM"}
          </Text>
        </Button>
      );
    }
  };

  return (
    <Fragment>
      <WumboDrawer.Header>
        <Flex w="full" justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="medium" color="indigo.500">
            Trade WUM
          </Text>
          {buyBaseLink()}
        </Flex>
      </WumboDrawer.Header>
      <WumboDrawer.Content>
        <Trade
          baseTicker={isTargetWUM ? "SOL" : "WUM"}
          ticker={ticker || ""}
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
  name,
  icon,
  ticker,
  buyBaseLink,
  tokenBonding,
}: TradeParams) => {
  console.log("tokenBonding", tokenBonding?.publicKey?.toBase58());
  const [buy, { loading: buyIsSubmitting, error: buyError }] = useBuy();
  const [sell, { loading: sellIsSubmitting, error: sellError }] = useSell();
  const { curve } = useBondingPricing(tokenBonding.publicKey);
  const fiatPrice = useFiatPrice(tokenBonding.baseMint);
  const toFiat = (a: number) => (fiatPrice || 0) * a;
  const fromFiat = (a: number) => a / (fiatPrice || 0);
  const targetMint = useMint(tokenBonding.targetMint);

  const { amount: ownedSol } = useSolOwnedAmount();
  const ownedBaseNormal = useOwnedAmount(tokenBonding.baseMint);
  const ownedBase = tokenBonding.baseMint.equals(SOL_TOKEN)
    ? ownedSol
    : ownedBaseNormal;
  const ownedTarget = useOwnedAmount(tokenBonding.targetMint);
  const location = useLocation();
  const { info: tokenRef } = useTokenRefFromBonding(tokenBonding.publicKey);

  const purchaseCap =
    tokenBonding.purchaseCap && targetMint
      ? amountAsNum(tokenBonding.purchaseCap as u64, targetMint)
      : Number.POSITIVE_INFINITY;
  const buyMax = Math.min(
    curve?.buyWithBaseAmount(
      ownedBase || 0,
      tokenBonding.baseRoyaltyPercentage,
      tokenBonding.targetRoyaltyPercentage
    ) || 0,
    purchaseCap
  );
  const sellMax = ownedTarget;

  handleErrors(buyError, sellError);

  const onHandleBuy = async (values: FormValues) => {
    await buy(tokenBonding.publicKey, +values.tokenAmount, BASE_SLIPPAGE);
    toast.custom((t) => (
      <Notification
        show={t.visible}
        type="success"
        heading="Transaction Succesful"
        message={`You now own ${Number(values.tokenAmount).toFixed(
          4
        )} of ${ticker}!`}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ));
  };

  const onHandleSell = async (values: FormValues) => {
    await sell(tokenBonding.publicKey, +values.tokenAmount, BASE_SLIPPAGE);

    toast.custom((t) => (
      <Notification
        show={t.visible}
        type="success"
        heading="Transaction Succesful"
        message={`You now own ${curve
          ?.sellTargetAmount(+values.tokenAmount)
          .toFixed(4)} of ${baseTicker}!`}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ));
  };

  const Info = (
    <Flex flexDir="column">
      <Text w="full" textAlign="left" fontSize="xs">
        Amounts shown in{" "}
        <Text display="inline" color="indigo.500">
          USD
        </Text>
      </Text>
      <Text w="full" textAlign="right" fontSize="xs">
        Own: {(ownedTarget || 0).toFixed(4)}
      </Text>
    </Flex>
  );

  return (
    <VStack spacing={4} padding={4}>
      <TokenPill
        curve={curve}
        tokenBonding={tokenBonding}
        name={name}
        ticker={ticker}
        icon={icon}
        detailsPath={
          tokenRef && viewProfilePath(tokenRef.publicKey) + location.search
        }
      />
      <Tabs isFitted w="full">
        <TabList>
          {!tokenBonding.buyFrozen && (
            <Tab
              color="gray.300"
              borderColor="gray.300"
              _selected={{ color: "indigo.500", borderColor: "indigo.500" }}
            >
              Buy
            </Tab>
          )}
          {!tokenBonding.sellFrozen && (
            <Tab
              color="gray.300"
              borderColor="gray.300"
              _selected={{ color: "indigo.500", borderColor: "indigo.500" }}
            >
              Sell
            </Tab>
          )}
        </TabList>

        <TabPanels>
          <TabPanel paddingX={0}>
            {ownedBase && ownedBase > 0 && (
              <>
                {Info}
                <TokenForm
                  tokenAmountMax={buyMax}
                  fiatAmountFromTokenAmount={(tokenAmount: number) =>
                    toFiat(
                      curve?.buyTargetAmount(
                        tokenAmount,
                        tokenBonding.baseRoyaltyPercentage,
                        tokenBonding.targetRoyaltyPercentage
                      ) || 0
                    )
                  }
                  tokenAmountFromFiatAmount={(fiatAmount: number) =>
                    curve?.buyWithBaseAmount(
                      fromFiat(fiatAmount),
                      tokenBonding.baseRoyaltyPercentage,
                      tokenBonding.targetRoyaltyPercentage
                    ) || 0
                  }
                  icon={icon}
                  ticker={ticker}
                  type="buy"
                  onSubmit={onHandleBuy}
                  submitting={buyIsSubmitting}
                />
                <Flex flexDir="column" justifyContent="center" marginTop={4}>
                  <Flex justifyContent="center" fontSize="xs">
                    You can buy up to {buyMax.toFixed(4)} {ticker} coins!
                  </Flex>
                </Flex>
              </>
            )}
            {(!ownedBase || ownedBase == 0) && (
              <Text>
                It looks like you don't have any {baseTicker}, which you'll need
                to buy {ticker} tokens. You can buy it by clicking here:{" "}
              </Text>
            )}
            <Flex justifyContent="center" marginTop={4}>
              {buyBaseLink(false)}
            </Flex>
          </TabPanel>
          <TabPanel paddingX={0}>
            {Info}
            <TokenForm
              tokenAmountMax={sellMax}
              fiatAmountFromTokenAmount={(tokenAmount: number) =>
                toFiat(Math.abs(curve?.sellTargetAmount(tokenAmount) || 0))
              }
              tokenAmountFromFiatAmount={(fiatAmount: number) =>
                Math.abs(
                  curve?.buyWithBaseAmount(-fromFiat(fiatAmount), 0, 0) || 0
                )
              }
              icon={icon}
              ticker={ticker}
              type="sell"
              onSubmit={onHandleSell}
              submitting={sellIsSubmitting}
            />
            <Flex flexDir="column" justifyContent="center" marginTop={4}>
              <Flex justifyContent="center" fontSize="xs">
                You can sell up to {sellMax?.toFixed(4)} {ticker} coins!
              </Flex>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};
