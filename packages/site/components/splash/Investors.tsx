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
import { LandingLayout } from "@/components";

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
              We&apos;ve partnered strategically with some of the best minds in
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
            <Image w={{ base: "35%", md: "20%" }} src="/MC.png" alt="mc" />
            <Image
              w={{ base: "35%", md: "20%" }}
              src="/Solana.png"
              alt="solana"
            />
            <Image
              w={{ base: "35%", md: "20%" }}
              src="/Asymmetric.png"
              alt="Asymmetric"
            />
            <Image w={{ base: "35%", md: "20%" }} src="/AR.png" alt="AR" />
            <Image w={{ base: "35%", md: "20%" }} src="/SL.png" alt="SL" />
          </HStack>
        </VStack>
      </Flex>
    </LandingLayout>
  </Box>
);
