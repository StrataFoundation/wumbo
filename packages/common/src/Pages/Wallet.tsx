import React from "react";
import { Link } from "react-router-dom";
import { RiCoinLine } from "react-icons/ri";
import toast from "react-hot-toast";
import {
  Text,
  Center,
  createIcon,
  Flex,
  HStack,
  Icon,
  StackDivider,
  VStack,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  useBondingPricing,
  useFiatPrice,
  useOwnedAmount,
  useSolOwnedAmount,
  useTokenMetadata,
} from "@strata-foundation/react";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import { useWumNetWorth, useUserTokensWithMeta } from "../hooks";
import {
  SOL_TOKEN,
  OPEN_TOKEN,
  OPEN_COLLECTIVE_KEY,
} from "../constants/globals";
import { Avatar } from "../Avatar";
import { Notification } from "../Notification";
import { Spinner } from "../Spinner";
import { WumboRankIcon } from "../svgs";
import { useWallet } from "@solana/wallet-adapter-react";

const SolLogoIcon = createIcon({
  displayName: "Solana",
  viewBox: "0 0 96 96",
  path: [
    <circle cx="48" cy="48" r="48" fill="black" />,
    <path
      d="M64.8743 43.4897C64.5684 43.1761 64.1536 43 63.7211 43H23.8174C23.0905 43 22.7266 43.9017 23.2408 44.4287L31.1257 52.5103C31.4316 52.8239 31.8464 53 32.2789 53H72.1826C72.9095 53 73.2734 52.0983 72.7592 51.5713L64.8743 43.4897Z"
      fill="url(#paint0_linear)"
    />,
    <path
      d="M31.1257 58.5352C31.4316 58.2231 31.8464 58.0478 32.2789 58.0478H72.1826C72.9095 58.0478 73.2734 58.9452 72.7592 59.4697L64.8743 67.5126C64.5684 67.8247 64.1536 68 63.7211 68H23.8174C23.0905 68 22.7266 67.1027 23.2408 66.5781L31.1257 58.5352Z"
      fill="url(#paint1_linear)"
    />,
    <path
      d="M31.1257 28.4874C31.4316 28.1753 31.8464 28 32.2789 28H72.1826C72.9095 28 73.2734 28.8973 72.7592 29.4219L64.8743 37.4648C64.5684 37.7769 64.1536 37.9522 63.7211 37.9522H23.8174C23.0905 37.9522 22.7266 37.0548 23.2408 36.5303L31.1257 28.4874Z"
      fill="url(#paint2_linear)"
    />,
    <defs>
      ,
      <linearGradient
        id="paint0_linear"
        x1="56.8029"
        y1="16.975"
        x2="28.0661"
        y2="70.6352"
        gradientUnits="userSpaceOnUse"
      >
        ,
        <stop stopColor="#00FFA3" />,
        <stop offset="1" stopColor="#DC1FFF" />,
      </linearGradient>
      ,
      <linearGradient
        id="paint1_linear"
        x1="56.8029"
        y1="17.0278"
        x2="28.2797"
        y2="70.545"
        gradientUnits="userSpaceOnUse"
      >
        ,
        <stop stopColor="#00FFA3" />,
        <stop offset="1" stopColor="#DC1FFF" />,
      </linearGradient>
      ,
      <linearGradient
        id="paint2_linear"
        x1="56.8029"
        y1="17.0278"
        x2="28.2797"
        y2="70.545"
        gradientUnits="userSpaceOnUse"
      >
        ,
        <stop stopColor="#00FFA3" />,
        <stop offset="1" stopColor="#DC1FFF" />,
      </linearGradient>
      ,
    </defs>,
  ],
});

export const TokenInfo = React.memo(
  ({
    tokenWithMeta,
    getTokenLink,
    highlighted,
  }: {
    highlighted?: boolean;
    tokenWithMeta: ITokenWithMetaAndAccount;
    getTokenLink: (tokenWithMeta: ITokenWithMetaAndAccount) => string;
  }) => {
    const { metadata, image, tokenRef, account } = tokenWithMeta;
    const openPrice = useFiatPrice(OPEN_TOKEN);
    const { curve } = useBondingPricing(tokenRef?.tokenBonding);
    const fiatPrice = openPrice && curve && openPrice * curve.current();
    const ownedAmount = useOwnedAmount(account?.mint);

    return (
      <Link to={getTokenLink(tokenWithMeta)}>
        <HStack
          padding={4}
          spacing={3}
          align="center"
          _hover={{ opacity: "0.5" }}
          borderColor={highlighted ? "indigo.500" : undefined}
          borderWidth={highlighted ? "1px" : undefined}
          borderRadius={highlighted ? "4px" : undefined}
        >
          <Avatar name={metadata?.data.symbol} src={image} />
          <Flex flexDir="column">
            <Text>{metadata?.data.name}</Text>
            <HStack align="center" spacing={1}>
              <Icon as={RiCoinLine} w="16px" h="16px" />
              <Text>
                {ownedAmount?.toFixed(2)} {metadata?.data.symbol}
              </Text>
              <Text color="gray.500">
                (~$
                {fiatPrice &&
                  ownedAmount &&
                  (fiatPrice * ownedAmount).toFixed(2)}
                )
              </Text>
            </HStack>
          </Flex>
        </HStack>
      </Link>
    );
  }
);

export const Wallet = React.memo(
  ({
    wumLeaderboardLink,
    getTokenLink,
    wumLink,
    solLink,
    sendLink,
  }: {
    getTokenLink: (tokenWithMeta: ITokenWithMetaAndAccount) => string;
    wumLink: string;
    solLink: string;
    wumLeaderboardLink: string;
    sendLink: string;
  }) => {
    const { metadata: openMetadata, image: openImage } =
      useTokenMetadata(OPEN_TOKEN);
    const { amount: solOwned } = useSolOwnedAmount();
    const solPrice = useFiatPrice(SOL_TOKEN);
    const openPrice = useFiatPrice(OPEN_TOKEN);
    const openOwned = useOwnedAmount(OPEN_TOKEN);
    const { adapter } = useWallet();
    const publicKey = adapter?.publicKey;
    const { data: tokens, loading } = useUserTokensWithMeta(
      publicKey || undefined
    );
    const { wumNetWorth } = useWumNetWorth(publicKey || undefined);

    return (
      <VStack
        align="stretch"
        w="full"
        spacing={4}
        divider={<StackDivider borderColor="gray.200" />}
      >
        <VStack align="stretch" w="full" spacing={4}>
          <Link to={wumLeaderboardLink}>
            <VStack
              _hover={{ opacity: 0.7 }}
              color="white"
              rounded={8}
              bg="linear-gradient(227.94deg, #6F27E6 12.77%, #5856EB 85.19%)"
              p="8px"
              spacing={0}
            >
              <HStack alignItems="center">
                <WumboRankIcon h="21px" w="21px" />
                <Text fontSize={26} fontWeight={800}>
                  {wumNetWorth?.toFixed(2)}
                </Text>
              </HStack>
              <HStack>
                <Text fontSize={16}>WUM Net Worth</Text>
                {wumNetWorth && openPrice && (
                  <Text fontSize={16} color="gray.400" mt={0}>
                    (~${(openPrice * wumNetWorth).toFixed(2)})
                  </Text>
                )}
              </HStack>
            </VStack>
          </Link>
          <SimpleGrid spacing={2} columns={2}>
            <Button
              flexGrow={1}
              colorScheme="indigo"
              onClick={() => {
                navigator.clipboard.writeText(publicKey?.toBase58() || "");
                toast.custom((t) => (
                  <Notification
                    show={t.visible}
                    type="info"
                    heading="Copied to Clipboard"
                    message={publicKey?.toBase58()}
                    onDismiss={() => toast.dismiss(t.id)}
                  />
                ));
              }}
            >
              Receive
            </Button>
            <Link style={{ flexGrow: 1 }} to={sendLink}>
              <Button flexGrow={1} w="full" colorScheme="indigo">
                Send
              </Button>
            </Link>
          </SimpleGrid>
          <VStack
            pt={2}
            align="stretch"
            divider={<StackDivider borderColor="gray.200" />}
            spacing={4}
            w="full"
          >
            <HStack
              direction="row"
              justifyContent="space-evenly"
              divider={<StackDivider borderColor="gray.200" />}
            >
              <Link style={{ flexGrow: 1, flexBasis: 0 }} to={wumLink}>
                <VStack
                  _hover={{ opacity: "0.5", cursor: "pointer" }}
                  spacing={1}
                  align="center"
                >
                  <Avatar name={openMetadata?.data.symbol} src={openImage} />
                  <HStack align="center" spacing={1}>
                    <Icon as={RiCoinLine} w="16px" h="16px" />
                    <Text>
                      {openOwned?.toFixed(2)} {openMetadata?.data.symbol}
                    </Text>
                  </HStack>
                  <Text color="gray.500">
                    (~${((openPrice || 0) * (openOwned || 0)).toFixed(2)})
                  </Text>
                </VStack>
              </Link>

              <VStack
                flexGrow={1}
                flexBasis={0}
                onClick={() => window.open(solLink, "_blank")}
                _hover={{ opacity: "0.5", cursor: "pointer" }}
                spacing={1}
                flexDir="column"
                align="center"
              >
                <Icon as={SolLogoIcon} w={"48px"} h={"48px"} />
                <HStack align="center" spacing={1}>
                  <Icon as={RiCoinLine} w="16px" h="16px" />
                  <Text>{solOwned?.toFixed(2)} SOL</Text>
                </HStack>
                <Text color="gray.500">
                  (~${((solPrice || 0) * solOwned).toFixed(2)})
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </VStack>
        <VStack
          align="stretch"
          w="full"
          spacing={0}
          mt={loading ? 0 : -4}
          divider={<StackDivider borderColor="gray.200" />}
        >
          {loading && (
            <Center>
              <Spinner size="lg" />
            </Center>
          )}
          {!loading &&
            tokens
              ?.filter(
                (t) =>
                  !!t.tokenRef &&
                  t.tokenRef.collective?.equals(OPEN_COLLECTIVE_KEY)
              )
              .sort((a, b) =>
                a.metadata!.data.name.localeCompare(b.metadata!.data.name)
              )
              .map((tokenWithMeta) => (
                <TokenInfo
                  key={tokenWithMeta.publicKey?.toBase58()}
                  tokenWithMeta={tokenWithMeta}
                  getTokenLink={getTokenLink}
                />
              ))}
        </VStack>
      </VStack>
    );
  }
);
