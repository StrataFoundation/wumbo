import React from "react";
import { Flex, FlexProps } from "@chakra-ui/react";

interface ILandingLayoutProps extends FlexProps {}

export const LandingLayout: React.FC<ILandingLayoutProps> = ({
  children,
  ...rest
}) => (
  <Flex
    direction="column"
    align="center"
    maxW={{ xl: "1200px" }}
    m="0 auto"
    {...rest}
  >
    {children}
  </Flex>
);
