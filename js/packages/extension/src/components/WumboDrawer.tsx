import React, { Fragment, ReactNode } from "react";
import { Route, NavLink } from "react-router-dom";
import startCase from "lodash/startCase";
import { Box, Fade, Spinner, Text, IconButton, Link } from "@chakra-ui/react";
import { HiOutlineX } from "react-icons/hi";
import { Toaster } from "react-hot-toast";
import { Transition } from "@headlessui/react";
import { useDrawer } from "@/contexts/drawerContext";
import { routes, IRoutes } from "@/constants/routes";
import { useUserInfo } from "@/utils/userState";
import { WUM_BONDING } from "wumbo-common";

export const WumboDrawer = (props: { children: ReactNode }) => {
  const { isOpen, toggleDrawer } = useDrawer();

  // TODO center on screen
  return (
    <Fragment>
      {isOpen && (
        <Box w="340px" pos="fixed" right="0" top="20">
          <Fade in={true} style={{ zIndex: 99999 }}>
            <Box
              w="340px"
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

  return (
    <Box
      paddingX="6px"
      paddingY="4px"
      borderBottom="1px"
      borderColor="gray.200"
    >
      <Box d="flex" alignItems="center" justifyContent="space-between">
        <Box w="full">
          {hasTitle && (
            <Text fontSize="lg" fontWeight="medium" color="purple.600">
              {(props as HeaderNoChildren).title}
            </Text>
          )}
          {!hasTitle && (props as HeaderWithChildren).children}
        </Box>
        <IconButton
          colorScheme="gray"
          variant="ghost"
          fontSize="lg"
          aria-label="Close Drawer"
          icon={<HiOutlineX />}
          onClick={() => toggleDrawer()}
        />
      </Box>
    </Box>
  );
};

// Minimal Styling, nested comps should style themselves
WumboDrawer.Content = (props: { children: ReactNode }) => (
  <Box pos="relative" flexGrow={1} overflowY="auto">
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
    >
      {Object.keys(routes).map((route) => {
        const { path, Icon, isDrawerNav } = routes[route as keyof IRoutes];

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
                <Link
                  as={NavLink}
                  to={filledPath}
                  d="inline-flex"
                  flexDir="column"
                  justifyContent="center"
                  alignItems="center"
                  color={match ? "purple.700" : "gray.600"}
                  fontWeight="medium"
                  p="4px"
                  borderBottom="3px"
                  borderBottomStyle="solid"
                  borderColor={match ? "purple.700" : "transparent"}
                >
                  {/* @ts-ignore */}
                  <Icon />
                  <Text fontSize="xs">{startCase(route)}</Text>
                </Link>
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
        <Spinner size="md" emptyColor="purple.900" color="purple.600" />
      </Box>
    </WumboDrawer.Content>
  </Fragment>
);
