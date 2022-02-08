import React, { useState } from "react";
import { Box, Flex, Text, FlexProps, Link, LinkProps } from "@chakra-ui/react";
import { LandingLayout } from "./";
import { DownloadButton } from "./";

interface IMenuItemProps extends LinkProps {
  isLast?: boolean;
}

const MenuItem: React.FC<IMenuItemProps> = ({
  children,
  isLast = false,
  href = "/",
  ...rest
}) => (
  <Text
    mb={{ base: isLast ? 0 : 8, sm: 0 }}
    mr={{ base: 0, sm: isLast ? 0 : 8 }}
    display="block"
    _hover={{ textDecoration: "underline" }}
  >
    <Link href={href} {...rest}>
      {children}
    </Link>
  </Text>
);

const CloseIcon = () => (
  <svg width="24" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <title>Close</title>
    <path
      fill="white"
      d="M9.00023 7.58599L13.9502 2.63599L15.3642 4.04999L10.4142 8.99999L15.3642 13.95L13.9502 15.364L9.00023 10.414L4.05023 15.364L2.63623 13.95L7.58623 8.99999L2.63623 4.04999L4.05023 2.63599L9.00023 7.58599Z"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="24px"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    fill="white"
  >
    <title>Menu</title>
    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
  </svg>
);

interface IHeaderProps extends FlexProps {}

export const Header: React.FC<IHeaderProps> = (props) => {
  const [show, setShow] = useState(false);
  const toggleMenu = () => setShow(!show);

  return (
    <Box
      bg="linear-gradient(272.23deg, #5D34A9 -0.32%, #413BB1 93.88%), #FFFFFF;"
      position="relative"
    >
      <LandingLayout>
        <Flex
          as="nav"
          align="center"
          justify="space-between"
          wrap="wrap"
          w="100%"
          p={8}
          bg="transparent"
          color="white"
          {...props}
        >
          <Flex align="center">
            {/* <Icon
              as={WumboIcon}
              w={10}
              h={10}
              _hover={{ cursor: "pointer" }}
              onClick={() => history.replace("/")}
            /> */}
            <Text fontSize="xl" ml={4}>
              Wum.bo
            </Text>
          </Flex>

          <Box display={{ base: "block", md: "none" }} onClick={toggleMenu}>
            {show ? <CloseIcon /> : <MenuIcon />}
          </Box>

          <Box
            display={{ base: show ? "block" : "none", md: "block" }}
            flexBasis={{ base: "100%", md: "auto" }}
          >
            <Flex
              align="center"
              justify={["center", "space-between", "flex-end", "flex-end"]}
              direction={["column", "row", "row", "row"]}
              pt={[4, 4, 0, 0]}
            >
              <MenuItem href="https://teamwumbo.medium.com/" isExternal>
                Blog
              </MenuItem>
              <MenuItem href="/tutorial">Tutorial</MenuItem>
              <MenuItem href="" isExternal isLast>
                <DownloadButton
                  variant="outline"
                  color="white"
                  bg="transparent"
                  _hover={{
                    color: "indigo.500",
                    bg: "white",
                  }}
                />
              </MenuItem>
            </Flex>
          </Box>
        </Flex>
      </LandingLayout>
    </Box>
  );
};

export default Header;
