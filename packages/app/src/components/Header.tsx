import React, { ReactNode } from "react";
import { Link, LinkProps, useHistory, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  Icon,
  Link as ChakraLink,
  useDisclosure,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stack,
  Text,
} from "@chakra-ui/react";
import { RiMenuLine, RiCloseLine, RiWallet3Line } from "react-icons/ri";
import { IoIosRadioButtonOn } from "react-icons/io";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTwWrappedSolMint } from "@strata-foundation/react";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import {
  WumboIcon,
  OPEN_BONDING,
  replaceAll,
  useReverseTwitter,
  useUserInfo,
} from "wumbo-common";
import { Routes } from "../constants/routes";

const Links = [
  {
    value: "Trade",
    to: Routes.swap.path,
  },
  {
    value: "My Tokens",
    to: Routes.wallet.path,
  },
];

const NavLink = ({
  to = "/",
  children,
  onClick,
  ...rest
}: {
  to: string;
  onClick?: () => void;
  children: ReactNode;
} & LinkProps) => (
  <ChakraLink
    px={4}
    py={1}
    fontSize="md"
    rounded={"md"}
    bg="rgba(0,0,0,0.1)"
    {...(onClick ? { onClick } : {})}
    _hover={{
      textDecoration: "none",
      bg: "indigo.600",
    }}
  >
    <Link to={to} {...rest}>
      <Text>{children}</Text>
    </Link>
  </ChakraLink>
);

export const Header: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { connected, disconnect, publicKey: wallet } = useWallet();
  const { handle: reverseHandle } = useReverseTwitter(wallet || undefined);
  const handle = reverseHandle || "";
  const creatorInfoState = useUserInfo(handle);
  const { userInfo: creatorInfo, loading } = creatorInfoState;
  const twSol = useTwWrappedSolMint();

  const redirectUri =
    Routes.manageWallet.path +
    `?redirect=${location.pathname}${location.search}`;

  const fillPath = (path: string): string => {
    const replacedKeys = replaceAll(path, {
      ":tokenBondingKey":
        creatorInfo?.tokenBonding?.publicKey?.toBase58() ||
        OPEN_BONDING.toBase58(),
      ":tokenRefKey": creatorInfo?.tokenRef?.publicKey.toBase58() || "",
      ":baseMint": twSol?.toBase58() || "",
      ":targetMint": SplTokenCollective.OPEN_COLLECTIVE_MINT_ID.toBase58(),
    });

    return `${replacedKeys}${reverseHandle ? "?name=" + reverseHandle : ""}`;
  };

  return (
    <>
      <Box
        px={4}
        color="white"
        bg="linear-gradient(272.23deg, #5D34A9 -0.32%, #413BB1 93.88%), #FFFFFF;"
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={
              isOpen ? (
                <Icon as={RiCloseLine} w={5} h={5} />
              ) : (
                <Icon as={RiMenuLine} w={5} h={5} />
              )
            }
            aria-label={"Open Menu"}
            display={{ base: "flex", md: "none" }}
            colorScheme="indigo"
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <HStack spacing={4}>
              <Icon
                as={WumboIcon}
                w={10}
                h={10}
                _hover={{ cursor: "pointer" }}
                onClick={() => history.push("/")}
              />
              <Text fontSize="xl">Wum.bo</Text>
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <HStack
              as={"nav"}
              mr={4}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {Links.map((link) => (
                <NavLink key={link.value} to={fillPath(link.to)}>
                  {link.value}
                </NavLink>
              ))}
              <Button
                as={Link}
                to={fillPath(Routes.profile.path)}
                variant={"solid"}
                colorScheme={"indigo"}
                size={"sm"}
                px={8}
              >
                My Profile
              </Button>
            </HStack>
            <Menu>
              <MenuButton
                as={IconButton}
                variant={"link"}
                mt={2}
                color="white"
                _hover={{ color: "gray.400" }}
                _active={{ color: "white" }}
                icon={
                  <Box position="relative">
                    <Icon w={5} h={5} as={RiWallet3Line} />
                    <Icon
                      w={4}
                      h={4}
                      fontWeight="bold"
                      position="absolute"
                      left={-1}
                      bottom={0}
                      as={IoIosRadioButtonOn}
                      color={connected ? "green.500" : "red.500"}
                    />
                  </Box>
                }
              />
              <MenuList color="black">
                <MenuItem onClick={() => history.push(redirectUri)}>
                  Connect
                </MenuItem>
                <MenuItem onClick={disconnect}>Disconnect</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              <Button
                as={Link}
                to={fillPath(Routes.profile.path)}
                onClick={isOpen ? onClose : onOpen}
                variant={"solid"}
                colorScheme={"indigo"}
                size={"sm"}
                px={8}
              >
                My Profile
              </Button>
              {Links.map((link) => (
                <NavLink
                  key={link.value}
                  to={fillPath(link.to)}
                  onClick={onClose}
                >
                  {link.value}
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
};
