import React, { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Button, Avatar, VStack, Text } from "@chakra-ui/react";
import { WumboDrawer } from "../WumboDrawer";
import { routes } from "@/constants/routes";
import { useWallet, useQuery } from "wumbo-common";
import ClaimOrCreate from "./ClaimOrCreate";

export const Create = () => {
  const location = useLocation();
  const query = useQuery();
  const { connected, publicKey } = useWallet();
  const currentPath = `${location.pathname}${location.search}`;

  return (
    <Fragment>
      <WumboDrawer.Header title="Create Coin" />
      <WumboDrawer.Content>
        <VStack spacing={4} padding={4}>
          <Box
            d="flex"
            w="full"
            alignItems="center"
            bg="gray.100"
            rounded="lg"
            padding={4}
          >
            <Avatar size="md" bg="indigo.500" src={query.get("img")!} />
            <Box
              d="flex"
              flexGrow={1}
              justifyContent="space-between"
              marginLeft={4}
            >
              <Text fontSize="xl" fontWeight="medium">
                {query.get("name")!}
              </Text>
              <Text fontSize="xl" fontWeight="medium">
                $0.00
              </Text>
            </Box>
          </Box>
          <Text w="full" fontSize="small">
            <Text fontWeight="bold">
              You will be the first to mint & own this person's token!
            </Text>{" "}
            It will remain unverified until this person verifies it. Should the
            person opt out, no new tokens may be purchased and exisiting tokens
            may still be sold.
          </Text>
          {connected && publicKey ? (
            <ClaimOrCreate />
          ) : (
            <Button
              as={Link}
              to={routes.wallet.path + `?redirect=${currentPath}`}
              size="md"
              w="full"
              colorScheme="indigo"
            >
              Connect Wallet
            </Button>
          )}
        </VStack>
      </WumboDrawer.Content>
      <WumboDrawer.Nav />
    </Fragment>
  );
};
