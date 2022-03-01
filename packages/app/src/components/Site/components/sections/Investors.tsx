import React from "react";
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Stack,
  VStack,
  HStack,
  Divider,
} from "@chakra-ui/react";
import { LandingLayout } from "../layouts/LandingLayout";

export const Investors: React.FC = () => (
  <Box
    bg="linear-gradient(272.23deg, #5D34A9 -0.32%, #413BB1 93.88%), #FFFFFF;"
    position="relative"
  >
    <LandingLayout>
      <Flex
        align="center"
        justify="center"
        direction="column"
        wrap="nowrap"
        minH="70vh"
        px={8}
        my={8}
      >
        <VStack spacing={10} w="full">
          <Stack
            spacing={6}
            w={{ base: "80%", md: "55%" }}
            align="center"
            color="white"
          >
            <Heading as="h1" size="lg" fontWeight="bold">
              Our Investors
            </Heading>
            <Text align="center">
              We've partnered strategically with some of the best minds in
              crypto because we want nothing but the best for you.
            </Text>
            <Divider />
          </Stack>
          <HStack
            spacing={{
              base: 4,
              md: 20,
            }}
            wrap="wrap"
            justifyContent="center"
          >
            <Image
              w={{ base: "35%", md: "20%" }}
              src={process.env.PUBLIC_URL + "MC.png"}
            />
            <Image
              w={{ base: "35%", md: "20%" }}
              src={process.env.PUBLIC_URL + "Solana.png"}
            />
            <Image
              w={{ base: "35%", md: "20%" }}
              src={process.env.PUBLIC_URL + "Asymmetric.png"}
            />
            <Image
              w={{ base: "35%", md: "20%" }}
              src={process.env.PUBLIC_URL + "AR.png"}
            />
            <Image
              w={{ base: "35%", md: "20%" }}
              src={process.env.PUBLIC_URL + "SL.png"}
            />
          </HStack>
        </VStack>
      </Flex>
    </LandingLayout>
  </Box>
);
