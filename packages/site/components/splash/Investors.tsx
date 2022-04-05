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
          <VStack justifyContent="center" spacing={4}>
            <Flex w="full" justifyContent="center">
              <Image w="600px" src="/MC.png" alt="multicoin capital" />
            </Flex>
            <HStack
              wrap="wrap"
              justifyContent="center"
              gap={{ base: 0, md: 8 }}
            >
              <Image
                w={{ base: "300px", md: "500px" }}
                src="/Solana.png"
                alt="solana"
              />
              <Image
                w={{ base: "300px", md: "400px" }}
                src="/SL.png"
                alt="starting line"
              />
            </HStack>
            <HStack
              wrap="wrap"
              justifyContent="center"
              gap={{ base: 0, md: 16 }}
            >
              <Image
                w={{ base: "300px", md: "400px" }}
                src="/AR.png"
                alt="alameda research"
              />
              <Image
                w={{ base: "300px", md: "400px" }}
                src="/Asymmetric.png"
                alt="asymmetric capital partners"
              />
            </HStack>
          </VStack>
        </VStack>
      </Flex>
    </LandingLayout>
  </Box>
);
