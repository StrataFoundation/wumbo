import React from "react";
import { Box, Center, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { Link, LinkProps } from "react-router-dom";
import { WumboIcon } from "wumbo-common";
import { DownloadButton } from "components/common/DownloadButton";

interface IMenuItemProps extends LinkProps {
  isLast?: boolean;
}

const MenuItem: React.FC<IMenuItemProps> = ({
  children,
  isLast = false,
  to = "/",
  ...rest
}) => (
  <Text
    mb={{ base: isLast ? 0 : 8, sm: 0 }}
    mr={{ base: 0, sm: isLast ? 0 : 8 }}
    display="block"
  >
    <Link to={to} {...rest}>
      {children}
    </Link>
  </Text>
);

export const Header: React.FC = () => (
  <Center
    w="full"
    paddingX={14}
    paddingY={4}
    justifyContent="space-between"
    alignItems="center"
    color="white"
    bg="linear-gradient(272.23deg, #5D34A9 -0.32%, #413BB1 93.88%), #FFFFFF;"
  >
    <HStack spacing={4}>
      <Icon as={WumboIcon} w={10} h={10} />
      <Text fontSize="xl">Wum.bo</Text>
    </HStack>
    <Box
      display={{ md: "block" }}
      flexBasis={{ base: "100%", md: "auto" }}
    >
      <Flex
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={["column", "row", "row", "row"]}
        pt={[4, 4, 0, 0]}
      >
        <MenuItem to="" target="_blank" isLast>
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
  </Center>
);
