import React from "react";
import { Box, Flex, Stack, Heading, Image } from "@chakra-ui/react";
import { LandingLayout } from "../layouts/LandingLayout";

export const XRay: React.FC = () => (
  <Box bg="gray.100">
    <LandingLayout>
      <Flex
        align="center"
        justify={{ base: "center", md: "space-around", xl: "space-between" }}
        direction={{ base: "column", md: "row" }}
        wrap="nowrap"
        minH="70vh"
        px={8}
        my={10}
      >
        <Stack
          spacing={6}
          w={{ base: "80%", md: "50%" }}
          align={["center", "center", "flex-start", "flex-start"]}
          mb={{ base: 10, md: 0 }}
        >
          <Heading
            as="h1"
            size="lg"
            fontWeight="bold"
            textAlign={["center", "center", "left", "left"]}
            bg="linear-gradient(273.71deg, #453AAF 14.63%, #106FEE 100.31%);"
            bgClip="text"
          >
            Finally, tokens that work with social networks you're already using.
          </Heading>
          <Heading
            as="h2"
            size="sm"
            opacity="0.8"
            fontWeight="bold"
            lineHeight={1.5}
            textAlign={["center", "center", "left", "left"]}
          >
            Let Wumbo be your X-Ray into the Metaverse.
          </Heading>
          <Heading
            as="h2"
            size="sm"
            opacity="0.8"
            fontWeight="normal"
            lineHeight={1.5}
            textAlign={["center", "center", "left", "left"]}
          >
            Using Twitter (and soon other platforms), we're able to identify who
            owns Wumbo social tokens and display them right in your Twitter
            feeds and threads!
          </Heading>
        </Stack>
        <Box w={{ base: "90%", sm: "80%", md: "70%" }} mb={{ base: 12, md: 0 }}>
          <Image
            size="100%"
            w={{ base: "100%", md: "80%" }}
            float={{ base: "none", md: "right" }}
            src={process.env.PUBLIC_URL + "xray.png"}
          />
        </Box>
      </Flex>
    </LandingLayout>
  </Box>
);
