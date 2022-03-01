import React from "react";
import { Box, Flex, Stack, Heading, Image } from "@chakra-ui/react";
import { LandingLayout } from "../layouts/LandingLayout";

export const Monetize: React.FC = () => (
  <LandingLayout>
    <Flex
      align="center"
      justify={{ base: "center", md: "space-around", xl: "space-between" }}
      direction={{ base: "column-reverse", md: "row" }}
      wrap="nowrap"
      px={8}
      mt={{ base: 16, sm: 16 }}
      mb={16}
    >
      <Box w={{ base: "90%", sm: "80%", md: "70%" }}>
        <Image
          size="100%"
          w={{ base: "100%", md: "90%" }}
          src={process.env.PUBLIC_URL + "monetize.png"}
        />
      </Box>
      <Stack
        spacing={6}
        w={{ base: "80%", md: "50%" }}
        align={["center", "center", "flex-start", "flex-start"]}
        zIndex="1"
      >
        <Heading
          as="h1"
          size="lg"
          fontWeight="bold"
          textAlign={["center", "center", "left", "left"]}
          bg="linear-gradient(273.71deg, #453AAF 14.63%, #106FEE 100.31%);"
          bgClip="text"
        >
          A new way to monetize...
          <br />
          <em>YOU</em> are the talent scout.
        </Heading>
        <Heading
          as="h2"
          size="sm"
          opacity="0.8"
          fontWeight="normal"
          lineHeight={1.5}
          textAlign={["center", "center", "left", "left"]}
        >
          Fund your favorite artist and be a part of their success.
        </Heading>
        <Heading
          as="h2"
          size="sm"
          opacity="0.8"
          fontWeight="normal"
          lineHeight={1.5}
          textAlign={["center", "center", "left", "left"]}
        >
          At Wumbo, we believe that talent discovery should be in the hands of
          the community, aka YOU.
        </Heading>
      </Stack>
    </Flex>
  </LandingLayout>
);
