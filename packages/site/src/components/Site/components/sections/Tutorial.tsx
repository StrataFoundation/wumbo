import {
  BackgroundProps,
  Box,
  Spacer,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  useMediaQuery,
} from "@chakra-ui/react";
import React from "react";
import { LandingLayout } from "../layouts/LandingLayout";
import { DownloadButton } from "components/common/DownloadButton";

import Tut1 from "../../../../assets/images/tut1.png";
import Tut2 from "../../../../assets/images/tut2.png";
import Tut3 from "../../../../assets/images/tut3.png";
import Tut4 from "../../../../assets/images/tut4.png";
import Tut5 from "../../../../assets/images/tut5.png";
import Tut6 from "../../../../assets/images/tut6.png";

interface ITutItem {
  imgSrc: string;
  tag: number;
  bg: BackgroundProps["bg"];
  heading: string;
  subText: string;
  children?: React.ReactNode;
}

const tutItems = (isMobile: boolean): Array<ITutItem> => {
  const order = isMobile ? [0, 1, 2, 3, 4, 5] : [1, 3, 5, 0, 2, 4];
  const items: Array<ITutItem> = [
    {
      imgSrc: Tut1,
      tag: 1,
      bg: "linear-gradient(272.23deg, #5D34A9 -0.32%, #413BB1 93.88%), #FFFFFF;",
      heading: "Download & Install",
      subText: "It only takes a few clicks to add Wum.bo to chrome.",
      children: (
        <Box mt={4}>
          <DownloadButton
            variant="link"
            color="white"
            fontWeight="normal"
            sx={{ textDecoration: "underline" }}
          />
        </Box>
      ),
    },
    {
      imgSrc: Tut2,
      tag: 2,
      bg: "gray.800",
      heading: "Claim Profile",
      subText:
        "While on Twitter, the extension will enable you to claim and create tokens for yourself and creators.",
      children: <Spacer p={4} />,
    },
    {
      imgSrc: Tut3,
      tag: 3,
      bg: "gray.800",
      heading: "Connect Wallet",
      subText: "Connect to your favorite wallet in a simple and secure way.",
      children: <Spacer p={4} />,
    },
    {
      imgSrc: Tut4,
      tag: 4,
      bg: "gray.800",
      heading: "Mint Tokens",
      subText:
        "Create a community and show support by minting tokens directly on the Twitter feed.",
      children: <Spacer p={4} />,
    },
    {
      imgSrc: Tut5,
      tag: 5,
      bg: "gray.800",
      heading: "Trading Tokens",
      subText:
        "Purchase and trade tokens by using the swap tab directly on the extension",
      children: <Spacer p={4} />,
    },
    {
      imgSrc: Tut6,
      tag: 6,
      bg: "gray.800",
      heading: "Reply Tokens",
      subText: "See which tokens others in the community are invested in.",
      children: <Spacer p={4} />,
    },
  ];

  return order.map((idx) => items[idx]);
};

const TutItem: React.FC<ITutItem> = ({
  imgSrc,
  tag,
  bg,
  heading,
  subText,
  children,
}) => (
  <Box py={6} d="inline-block">
    <Box bg={bg} rounded="lg" color="white">
      <Flex flexDirection="column" justifyContent="space-between">
        <Box px={8} flex={1} mb={10}>
          <Box
            px={5}
            py={2}
            bg="green.400"
            d="inline-block"
            rounded="lg"
            position="relative"
            top="-4"
          >
            <Text fontSize="2xl" fontWeight="900">
              {tag}
            </Text>
          </Box>
          <VStack align="left" spacing={1}>
            <Text fontSize="lg" fontWeight="bold">
              {heading}
            </Text>
            <Text fontSize="md">{subText}</Text>
          </VStack>
          {children}
        </Box>
        <Image src={imgSrc} />
      </Flex>
    </Box>
  </Box>
);

export const Tutorial: React.FC = () => {
  const [isMobile] = useMediaQuery("(max-width: 760px)");

  return (
    <Box bg="gray.100">
      <LandingLayout>
        <Flex
          align="center"
          justify={{ base: "center", md: "space-around", xl: "space-between" }}
          direction={{ base: "column", md: "row" }}
          wrap="nowrap"
          py={12}
          px={8}
        >
          <Box w="100%" sx={{ columnCount: [1, 1, 2], columnGap: 8 }}>
            <VStack
              spacing={6}
              py={6}
              align={["center", "center", "flex-start", "flex-start"]}
            >
              <Heading
                as="h2"
                size="sm"
                opacity="0.8"
                fontWeight="bold"
                lineHeight={1.5}
                textAlign={["center", "center", "left", "left"]}
              >
                HOW DOES IT WORK?
              </Heading>
              <Heading
                as="h1"
                size="lg"
                fontWeight="bold"
                textAlign={["center", "center", "left", "left"]}
                bg="linear-gradient(273.71deg, #453AAF 14.63%, #106FEE 100.31%);"
                bgClip="text"
              >
                Start by downloading the Chrome extension.
              </Heading>
              <Heading
                as="h2"
                size="sm"
                opacity="0.8"
                fontWeight="normal"
                lineHeight={1.5}
                textAlign={["center", "center", "left", "left"]}
              >
                And follow these six easy steps to get up and running with Wumbo
                and your very own social token!
              </Heading>
            </VStack>
            {tutItems(isMobile).map((tutItem, tutItemId) => (
              <TutItem key={`tutItem-${tutItemId}`} {...tutItem} />
            ))}
            <VStack
              py={6}
              spacing={6}
              align={["center", "center", "flex-start", "flex-start"]}
            >
              <Heading
                as="h2"
                size="sm"
                opacity="0.8"
                fontWeight="bold"
                lineHeight={1.5}
                textAlign={["center", "center", "left", "left"]}
              >
                Ready to start?
              </Heading>
              <Heading
                as="h2"
                size="sm"
                opacity="0.8"
                fontWeight="normal"
                lineHeight={1.5}
                textAlign={["center", "center", "left", "left"]}
              >
                Build a thriving community and join them on their journey to the
                top!
              </Heading>
              <DownloadButton
                variant="link"
                bg="linear-gradient(273.71deg, #453AAF 14.63%, #106FEE 100.31%);"
                bgClip="text"
              />
            </VStack>
          </Box>
        </Flex>
      </LandingLayout>
    </Box>
  );
};
