import React, { useRef, Fragment, ReactNode, useContext } from "react";
import { Route, NavLink, Link, useHistory } from "react-router-dom";
import startCase from "lodash/startCase";
import { Flex, Box, Slide, Text, Button, Icon } from "@chakra-ui/react";
import { HiOutlineX } from "react-icons/hi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { BiRadioCircleMarked } from "react-icons/bi";
import { RiWallet3Line } from "react-icons/ri";
import { Toaster } from "react-hot-toast";
import { useDrawer } from "@/contexts/drawerContext";
import { routes, IRoutes } from "@/constants/routes";
import { useUserInfo } from "@/utils/userState";
import {
  replaceAll,
  Spinner,
  OPEN_BONDING,
  useReverseTwitter,
} from "wumbo-common";
import { useHistoryList } from "@/utils/history";
import { useWallet } from "@solana/wallet-adapter-react";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import Logo from "../../public/assets/img/logo.svg";
import { WalletAutoConnect } from "./wallet/WalletAutoConnect";
import { useTwWrappedSolMint } from "@strata-foundation/react";

export const OutsideOfDrawerRef =
  React.createContext<React.MutableRefObject<HTMLInputElement> | null>(null);

export const useOutsideOfDrawerRef = (): React.RefObject<any> => {
  return useContext(OutsideOfDrawerRef)!;
};

export const WumboDrawer = (props: { children: ReactNode }) => {
  const outsideOfDrawerRef =
    useRef() as React.MutableRefObject<HTMLInputElement>;
  const { isOpen, toggleDrawer } = useDrawer();
  const tab = (
    <Box
      bg="indigo.500"
      w="38px"
      h="38px"
      backgroundImage="linear-gradient(49deg, #2323ff -12%, #4f51ff 34%, #a53ef4 98%)"
      roundedTopLeft="lg"
      roundedBottomLeft="lg"
      shaddow="md"
      onClick={() => toggleDrawer({ isOpen: !isOpen })}
      _hover={{ cursor: "pointer" }}
    >
      <Icon h="38px" w="38px" as={Logo} />
    </Box>
  );

  return (
    <Fragment>
      {!isOpen && (
        <Box pos="fixed" right="0" style={{ top: "calc(50% - 246px)" }}>
          {tab}
        </Box>
      )}
      <Box ref={outsideOfDrawerRef} zIndex={200} />
      {isOpen && <WalletAutoConnect />}

      <OutsideOfDrawerRef.Provider value={outsideOfDrawerRef}>
        <Slide
          direction="right"
          in={isOpen}
          style={{ width: "345px", zIndex: 100 }}
        >
          <Box
            // w="345px"
            pos="fixed"
            right="0"
            style={{ top: "calc(50% - 280px)" }}
            w="345px"
            h="560px"
            bg="white"
            d="flex"
            flexDir="column"
            roundedTopLeft="lg"
            roundedBottomLeft="lg"
            shadow="md"
          >
            {props.children}
          </Box>
          <Box pos="fixed" right="345px" style={{ top: "calc(50% - 246px)" }}>
            {tab}
          </Box>
        </Slide>
      </OutsideOfDrawerRef.Provider>
    </Fragment>
  );
};

interface HeaderNoChildren {
  title?: string;
}

interface HeaderWithChildren {
  children: ReactNode;
}

type HeaderProps = HeaderNoChildren | HeaderWithChildren;

WumboDrawer.Header = (props: HeaderProps) => {
  const { toggleDrawer } = useDrawer();
  const hasTitle = !!(props as HeaderNoChildren).title;
  const { connected } = useWallet();
  const historyList = useHistoryList();
  const history = useHistory();

  return (
    <Flex
      padding={4}
      borderBottom="1px"
      borderColor="gray.200"
      fontFamily="body"
      minH="61px"
    >
      <Flex w="full" alignItems="center" justifyContent="space-between">
        <Flex w="full" alignItems="center">
          {historyList.length > 1 && (
            <Link
              // This should look and behave like a link, but it actually needs to pop things off from the history stack.
              onClick={(e) => {
                e.preventDefault();
                history.goBack();
              }}
              to={historyList[historyList.length - 2]}
            >
              <Flex alignItems="center">
                <Icon
                  mr={2}
                  w={5}
                  h={5}
                  as={IoMdArrowRoundBack}
                  fontSize="lg"
                  fontWeight="medium"
                  color="indigo.500"
                />
              </Flex>
            </Link>
          )}
          {hasTitle && (
            <Text fontSize="lg" fontWeight="medium" color="indigo.500">
              {(props as HeaderNoChildren).title}
            </Text>
          )}
          {!hasTitle && (props as HeaderWithChildren).children}
        </Flex>
        <Flex pl={2} alignItems="center">
          <Box pr={2}>
            <Link to={routes.manageWallet.path}>
              <Box position="relative">
                <Icon
                  color="gray.500"
                  _hover={{ color: "gray.600", cursor: "pointer" }}
                  w={5}
                  h={5}
                  as={RiWallet3Line}
                />
                <Icon
                  w={4}
                  h={4}
                  fontWeight="bold"
                  position="absolute"
                  left={-1}
                  bottom={0}
                  as={BiRadioCircleMarked}
                  color={connected ? "green.500" : "red.500"}
                />
              </Box>
            </Link>
          </Box>
        </Flex>

        <Box
          pl="8px"
          color="gray.500"
          _hover={{ color: "gray.600", cursor: "pointer" }}
          onClick={() => toggleDrawer()}
        >
          <Icon as={HiOutlineX} w={5} h={5} />
        </Box>
      </Flex>
    </Flex>
  );
};

// Minimal Styling, nested comps should style themselves
WumboDrawer.Content = (props: { children: ReactNode }) => (
  <Box pos="relative" flexGrow={1} overflowY="auto" fontFamily="body">
    {props.children}
  </Box>
);

WumboDrawer.Nav = () => {
  const { creator } = useDrawer();
  const { publicKey: wallet } = useWallet();
  const { handle: reverseHandle } = useReverseTwitter(wallet || undefined);
  const handle = creator?.name || reverseHandle || "";
  const creatorInfoState = useUserInfo(handle);
  const { userInfo: creatorInfo, loading } = creatorInfoState;
  const twSol = useTwWrappedSolMint();

  return (
    <Box w="full" position="relative">
      <Toaster
        position="bottom-center"
        containerStyle={{
          position: "relative",
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          pointerEvents: "auto",
        }}
      />
      <Box
        d="flex"
        alignItems="center"
        justifyContent="space-around"
        pt="4px"
        px="4px"
        borderTop="1px"
        borderColor="gray.200"
        fontFamily="body"
        height="56px"
      >
        {Object.keys(routes).map((route) => {
          const {
            path,
            Icon: RouteIcon,
            isDrawerNav,
            exact,
          } = routes[route as keyof IRoutes];

          // Fill paths with params in
          let filledPath = path;
          const replacedKeys = replaceAll(path, {
            ":tokenBondingKey":
              creatorInfo?.tokenBonding?.publicKey?.toBase58() ||
              OPEN_BONDING.toBase58(),
            ":tokenRefKey": creatorInfo?.tokenRef?.publicKey.toBase58() || "",
            ":action": "buy",
            ":baseMint": twSol?.toBase58() || "",
            ":targetMint":
              SplTokenCollective.OPEN_COLLECTIVE_MINT_ID.toBase58(),
          });
          filledPath = `${replacedKeys}${
            reverseHandle ? "?name=" + reverseHandle : ""
          }`;

          if (isDrawerNav && Icon) {
            return (
              <Route
                key={path}
                path={path}
                exact={exact}
                children={({ match }) => (
                  <Button
                    as={NavLink}
                    to={filledPath}
                    d="inline-flex"
                    flexDir="column"
                    variant="unstyled"
                    justifyContent="center"
                    alignItems="center"
                    color={match ? "indigo.500" : "gray.600"}
                    fontWeight="medium"
                    h="full"
                    borderBottom="3px"
                    borderBottomStyle="solid"
                    borderColor={match ? "indigo.500" : "transparent"}
                    borderRadius="none"
                  >
                    {/* @ts-ignore */}
                    <Icon as={RouteIcon} w={6} h={6} />
                    <Text fontSize="xs">{startCase(route)}</Text>
                  </Button>
                )}
              />
            );
          } else {
            return null;
          }
        })}
      </Box>
    </Box>
  );
};

WumboDrawer.Loading = () => (
  <Fragment>
    <WumboDrawer.Header />
    <WumboDrawer.Content>
      <Box d="flex" justifyContent="center" alignItems="center" h="full">
        <Spinner />
      </Box>
    </WumboDrawer.Content>
  </Fragment>
);
