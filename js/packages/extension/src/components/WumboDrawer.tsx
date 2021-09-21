import React, { Fragment, ReactNode } from "react";
import { Route, NavLink, Link, useHistory } from "react-router-dom";
import startCase from "lodash/startCase";
import { Flex, Box, Fade, Text, IconButton, Button, Icon } from "@chakra-ui/react";
import { HiOutlineX } from "react-icons/hi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { BiRadioCircleMarked } from "react-icons/bi";
import { RiWallet3Line } from "react-icons/ri";
import { Toaster } from "react-hot-toast";
import { Transition } from "@headlessui/react";
import { useDrawer } from "@/contexts/drawerContext";
import { routes, IRoutes } from "@/constants/routes";
import { useUserInfo } from "@/utils/userState";
import { WalletAutoReconnect, useWallet, Spinner, WUM_BONDING } from "wumbo-common";

export const WumboDrawer = (props: { children: ReactNode }) => {
  const { isOpen, toggleDrawer } = useDrawer();

  // TODO center on screen
  return (
    <Fragment>
      {isOpen && (
        <Box w="345px" pos="fixed" right="0" top="20">
          <WalletAutoReconnect />
          <Fade in={true} style={{ zIndex: 99999 }}>
            <Box
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
          </Fade>
        </Box>
      )}
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
  const history = useHistory();

  return (
    <Box
      padding={4}
      borderBottom="1px"
      borderColor="gray.200"
      fontFamily="body"
    >
      <Box d="flex" alignItems="center" justifyContent="space-between">
        <Flex w="full" alignItems="center">
          { history.length > 1 && 
          <Box
            _hover={{cursor: "pointer"}}
            onClick={() => history.goBack()}
          >
            <Icon
              mr={2}
              w={5}
              h={5}
              as={IoMdArrowRoundBack}
              fontSize="lg"
              fontWeight="medium"
              color="indigo.500"
            />
          </Box>
          }
          {hasTitle && (
            <Text fontSize="lg" fontWeight="medium" color="indigo.500">
              {(props as HeaderNoChildren).title}
            </Text>
          )}
          {!hasTitle && (props as HeaderWithChildren).children}
        </Flex>
        <Flex alignItems="center">
          <Box pr={2}>
            <Link
              to={routes.manageWallet.path}
            >
              <Box position="relative">
                <Icon as={RiWallet3Line} />
                <Icon
                  w={4}
                  h={4}
                  fontWeight="bold"
                  position="absolute"
                  left={-1.5}
                  bottom={-1.5}
                  as={BiRadioCircleMarked}
                  color={connected ? "green.500" : "red.500"}
                />
              </Box>
            </Link>
          </Box>
        </Flex>

        <Box
          color="gray.400"
          _hover={{ color: "gray.500", cursor: "pointer" }}
          onClick={() => toggleDrawer()}
        >
          <Icon as={HiOutlineX} w={5} h={5} />
        </Box>
        
      </Box>
    </Box>
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
  const creatorInfoState = useUserInfo(creator?.name!);
  const { userInfo: creatorInfo, loading } = creatorInfoState;

  return (
    <Box
      d="flex"
      justifyContent="space-around"
      pt="4px"
      px="4px"
      borderTop="1px"
      borderColor="gray.200"
      fontFamily="body"
    >
      {Object.keys(routes).map((route) => {
        const {
          path,
          Icon: RouteIcon,
          isDrawerNav,
        } = routes[route as keyof IRoutes];

        // Fill paths with params in
        let filledPath = path;
        if (path.endsWith(":tokenBondingKey")) {
          filledPath = `${path.replace(
            ":tokenBondingKey",
            creatorInfo?.tokenBonding?.publicKey?.toBase58() ||
              WUM_BONDING.toBase58()
          )}${creatorInfo ? "?name=" + creatorInfo.name : ""}`;
        }

        if (isDrawerNav && Icon) {
          return (
            <Route
              key={path}
              path={filledPath}
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
                  p="4px"
                  borderBottom="3px"
                  borderBottomStyle="solid"
                  borderColor={match ? "indigo.500" : "transparent"}
                  borderRadius="none"
                >
                  {/* @ts-ignore */}
                  <Icon as={RouteIcon} w={5} h={5} />
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
