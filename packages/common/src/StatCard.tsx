import React from "react";
import {
  HStack,
  Flex,
  FlexProps,
  Text,
  Icon,
  createIcon,
  Box,
} from "@chakra-ui/react";
import { RiCoinLine } from "react-icons/ri";
import { WumboRankIcon } from "./svgs";
import { TokenTier, getTierGradient } from "./hooks/useTokenTier";

interface IStatCardProps extends FlexProps {
  label: string;
  value?: string;
  tier?: TokenTier;
  tag?: string;
}

const TagGradients: Record<TokenTier, string> = {
  Platinum:
    "conic-gradient(from -0.22deg at 48.39% 48.72%, #7C9DBF 0deg, #A3D0E6 138.61deg, #40679C 207.87deg, #4D6F88 257.83deg, #576D88 360deg), linear-gradient(185.95deg, #824C17 -3.23%, #D6B23F 5.3%, #FCFBE6 18.62%, #FDFEF9 24.45%, #FCFBE6 31.65%, #E6C970 55.56%, #F8E39F 67.64%, #AC874D 81.76%);",
  Gold: "linear-gradient(97.45deg, #AF8950 21.62%, #EDD78A 74.86%, #AF8950 110.51%), linear-gradient(188.27deg, #824C17 -19.93%, #D6B23F -8.48%, #FCFBE6 9.41%, #FDFEF9 17.24%, #FCFBE6 26.91%, #E6C970 59.03%, #F8E39F 75.24%, #AC874D 94.21%)",
  Silver:
    "linear-gradient(97.45deg, #777777 21.62%, #D5D5D5 74.86%, #7C7C7C 110.51%), linear-gradient(188.27deg, #824C17 -19.93%, #D6B23F -8.48%, #FCFBE6 9.41%, #FDFEF9 17.24%, #FCFBE6 26.91%, #E6C970 59.03%, #F8E39F 75.24%, #AC874D 94.21%)",
};

export const StatCard = ({
  _hover,
  tag,
  tier,
  label,
  value,
  ...flexProps
}: IStatCardProps) => {
  const Inner = (
    <Flex
      justifyContent="space-between"
      flexDir="column"
      w="100%"
      bgColor="gray.100"
      padding={3}
      rounded="lg"
      {...flexProps}
    >
      <Text fontSize="xs" color="gray.500">
        {label}
      </Text>
      <Text fontWeight={500} fontSize="md">{value}</Text>
    </Flex>
  );

  if (tier || tag) {
    return (
      <Box
        _hover={_hover}
        position="relative"
        w="100%"
        borderRadius="10px"
        padding={"2px"}
        background={getTierGradient(tier) || "gray.100"}
      >
        {Inner}
        {tag && (
          <>
            <Box
              minWidth="30px"
              h="16px"
              top="0"
              right="0"
              borderBottomLeftRadius="9px"
              borderTopRightRadius="9px"
              transform="rotate(-180deg)"
              position="absolute"
              background={tier ? TagGradients[tier] : "gray.300"}
            >
              {/* Purely to get the width right */}
              <Text
                paddingTop="1px"
                paddingLeft="6px"
                paddingRight="8px"
                fontSize="10px"
                fontWeight="900"
                opacity={0}
              >
                {tag}
              </Text>
            </Box>
            <Text
              minWidth="30px"
              paddingTop="1px"
              paddingLeft="6px"
              paddingRight="8px"
              textAlign="center"
              h="16px"
              fontSize="10px"
              fontWeight="900"
              top="0px"
              right="0px"
              color={tier ? "white" : "gray.500"}
              position="absolute"
            >
              {tag}
            </Text>
          </>
        )}
      </Box>
    );
  }

  return Inner;
};

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
    <Flex
      justifyContent="space-between"
      flexDir="column"
      flexGrow={1}
      lineHeight="normal"
    >
      <Text fontSize="12px">#{value}</Text>
      <Text fontSize="10px" color="gray.500">
        {label}
      </Text>
    </Flex>
  </HStack>
);
