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

interface IStatCardProps extends FlexProps {
  label: string;
  value?: string;
}

const WumboRankIcon = createIcon({
  displayName: "WumboRank",
  viewBox: "0 0 24 24",
  path: [
    <circle
      cx="12"
      cy="12"
      r="11.025"
      stroke="currentColor"
      stroke-width="1.95"
    />,
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M7.5792 8.4108c-.443-.7534-1.413-1.005-2.1664-.562-.7534.443-1.005 1.4128-.562 2.1662l3.1873 5.4206a1.5824 1.5824 0 0 0 2.7152.0221l1.9128-3.1355 1.7739 3.0977c.4343.7585 1.4012 1.0212 2.1597.5869.7584-.4343 1.0212-1.4013.5869-2.1597l-3.1042-5.4206a1.5823 1.5823 0 0 0-2.7242-.0378l-1.931 3.1651-1.848-3.143Zm12.1135.8014c0 .7448-.6038 1.3485-1.3485 1.3485-.7448 0-1.3485-.6037-1.3485-1.3485 0-.7447.6037-1.3485 1.3485-1.3485.7447 0 1.3485.6038 1.3485 1.3485Z"
      clip-rule="evenodd"
    />,
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M7.4648 8.4794c-.406-.6906-1.2952-.9213-1.9858-.5152-.6906.406-.9213 1.2951-.5152 1.9858l3.1873 5.4206a1.4508 1.4508 0 0 0 2.4889.0202l2.029-3.3259 1.8847 3.2913c.3982.6952 1.2845.9361 1.9798.5379.6952-.3981.9361-1.2845.538-1.9797l-3.1042-5.4206a1.4507 1.4507 0 0 0-2.4972-.0346l-2.0456 3.3531-1.9597-3.333Zm-2.1195-.7426c.8162-.4799 1.867-.2073 2.3469.6089l1.7365 2.9533 1.8162-2.9772a1.7144 1.7144 0 0 1 2.9513.041l3.1041 5.4205c.4706.8217.1859 1.8692-.6357 2.3397-.8217.4705-1.8692.1859-2.3397-.6358l-1.6631-2.9041-1.7966 2.945a1.7145 1.7145 0 0 1-2.9414-.0239l-3.1874-5.4205c-.4799-.8162-.2073-1.867.609-2.3469ZM16.8632 9.214c0-.8176.6627-1.4804 1.4803-1.4804s1.4804.6628 1.4804 1.4804-.6628 1.4804-1.4804 1.4804-1.4803-.6628-1.4803-1.4804Zm1.4803-1.2166c-.6719 0-1.2166.5447-1.2166 1.2166 0 .672.5447 1.2166 1.2166 1.2166.6719 0 1.2166-.5447 1.2166-1.2166 0-.672-.5447-1.2166-1.2166-1.2166Z"
      clip-rule="evenodd"
    />,
  ],
});

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
      <Text fontSize="12px">{value}</Text>
      <Text fontSize="10px" color="gray.500">
        {label}
      </Text>
    </Flex>
  </HStack>
);
