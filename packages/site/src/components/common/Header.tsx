import React from "react";
import { Flex, HStack, Text } from "@chakra-ui/react";
import { ReactComponent as Logo } from "../../assets/images/logo.svg";

const Header = ({
  children,
  gradient = true,
  size = "lg",
}: {
  children?: React.ReactElement;
  gradient?: boolean;
  size?: "lg" | "sm";
}) => (
  <Flex
    w="full"
    justifyContent="space-between"
    alignItems="center"
    paddingX={10}
    paddingY={size === "lg" ? 6 : 3}
    bg={
      gradient
        ? `linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.28))`
        : ""
    }
  >
    <HStack>
      <Logo width="40" height="40" />
      <Text fontSize="xl">Wum.bo</Text>
    </HStack>

    {children}
  </Flex>
);

export default Header;
