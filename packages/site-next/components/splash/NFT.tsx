import React from "react";
import { Box, Flex, Stack, Heading, Image } from "@chakra-ui/react";
import { LandingLayout } from "@/components/index";

export const NFT: React.FC = () => (
  <Box position="relative">
    <LandingLayout>
      <Flex
        align="center"
        justify={{ base: "center", md: "space-around", xl: "space-between" }}
        direction={{ base: "column-reverse", md: "row" }}
        wrap="nowrap"
        px={8}
        mt={20}
        mb={10}
      >
        <Box
          w={{ base: "90%", sm: "80%", md: "70%" }}
          ml={{
            base: 0,
            md: -52,
          }}
        >
          <Image src="/nft.png" boxSize="100%" alt="nftrow" />
        </Box>
        <Stack
          spacing={6}
          w={{ base: "80%", md: "40%" }}
          align={["center", "center", "flex-start", "flex-start"]}
          mb={{ base: 10, md: 0 }}
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
            Oh, and you can finally show off your brand new shiny NFT...
          </Heading>
          <Heading
            as="h2"
            size="sm"
            opacity="0.8"
            fontWeight="normal"
            lineHeight={1.5}
            textAlign={["center", "center", "left", "left"]}
          >
            Yes, you heard us right. You get to show off your NFT's and let your
            followers know what you own. You can also tag other NFT's you see in
            the wild.
          </Heading>
        </Stack>
      </Flex>
    </LandingLayout>
  </Box>
);
