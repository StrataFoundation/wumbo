import React from "react";
import { Text } from "@chakra-ui/react";

export const LeaderboardNumber = React.memo(
  ({
    children = null as any,
    selected = false,
  }: {
    children: any;
    selected?: boolean;
  }) => (
    <Text
      // fontWeight="semibold"
      fontSize="sm"
      color={selected ? "gray.700" : "gray.400"}
      textAlign="center"
    >
      {children}
    </Text>
  )
);
