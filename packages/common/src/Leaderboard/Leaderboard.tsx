import React from "react";
import { Flex, Center, Stack, StackDivider } from "@chakra-ui/react";

interface ILeaderboardProps {
  numbers: React.ReactElement[];
  elements: React.ReactElement[];
}

function zip<A>(a: A[], b: A[]): A[][] {
  return a.map((k, i) => [k, b[i]]);
}

export const Leaderboard = React.memo(
  ({ numbers, elements }: ILeaderboardProps) => {
    return (
      <Stack
        w="full"
        direction="column"
        divider={<StackDivider borderColor="gray.200" />}
        spacing={0}
      >
        {zip(numbers, elements).map(([number, element]) => (
          <Stack
            key={number.key}
            w="full"
            direction="row"
            spacing={4}
            padding={2}
            _hover={{ bgColor: "gray.100", cursor: "pointer" }}
          >
            <Center>{number}</Center>
            <Flex flexGrow={1}>{element}</Flex>
          </Stack>
        ))}
      </Stack>
    );
  }
);
