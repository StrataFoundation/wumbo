import React from "react";
import {
  HStack,
  Flex,
  FlexProps,
  Text,
  Icon,
  createIcon,
} from "@chakra-ui/react";
import { RiCoinLine } from "react-icons/ri";
import { WumboRankIcon } from "./svgs";

interface IStatCardProps extends FlexProps {
  label: string;
  value?: string;
}

export const StatCard = ({ label, value, ...flexProps }: IStatCardProps) => (
  <Flex
    flexDir="column"
    flexGrow={1}
    w="full"
    bgColor="gray.100"
    padding={3}
    rounded="lg"
    {...flexProps}
  >
    <Text fontSize="xs" color="gray.500">
      {label}
    </Text>
    <Text fontSize="md">{value}</Text>
  </Flex>
);

interface IStatCardWithIconProps extends IStatCardProps {
  icon: "coin" | "wumbo";
}

// TODO: (Bry) Get WUMBOIcon loading
export const StatCardWithIcon = ({
  label,
  value,
  icon,
  ...flexProps
}: IStatCardWithIconProps) => (
  <HStack
    _hover={{ cursor: "pointer", bgColor: "gray.100" }}
    w="full"
    spacing={2}
    padding={2}
    rounded="lg"
    borderWidth="2px"
    borderColor="gray.100"
  >
    {icon === "coin" && (
      <Icon as={RiCoinLine} w="16px" h="16px" color="yellow.400" />
    )}
    {icon === "wumbo" && (
      <WumboRankIcon w="16px" h="16px" color="indigo.500" fill="none" />
    )}
    <Flex flexDir="column" flexGrow={1} lineHeight="normal">
      <Text fontSize="12px">#{value}</Text>
      <Text fontSize="10px" color="gray.500">
        {label}
      </Text>
    </Flex>
  </HStack>
);
