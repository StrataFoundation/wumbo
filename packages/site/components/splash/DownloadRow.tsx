import React from "react";
import { Box, Flex, Stack, Heading, Text } from "@chakra-ui/react";
import { LandingLayout, DownloadButton } from "@/components";

export const DownloadRow: React.FC = () => (
  <Box bg="linear-gradient(272.23deg, #5D34A9 -0.32%, #413BB1 93.88%), #FFFFFF;">
    <LandingLayout>
      <Flex
        align="center"
        justify={{ base: "center", md: "space-around", xl: "space-between" }}
        direction={{ base: "column", md: "row" }}
        wrap="nowrap"
        py={4}
        px={8}
        my={2}
      >
        <Stack
          spacing={6}
          w={{ base: "80%, md: 50%" }}
          align={["center", "center", "flex-start", "flex-start"]}
          mb={{ base: 10, md: 0 }}
        >
          <Heading
            as="h1"
            size="md"
            color="white"
            fontWeight="bold"
            textAlign={["center", "center", "left", "left"]}
          >
            Ready to start backing your favorite creators, artists, and
            influencers{" "}
            <Text as="span" fontWeight="light">
              with Wumbo?
            </Text>
          </Heading>
        </Stack>
        <Box
          w={{ base: "90%", sm: "80%", md: "50%" }}
          textAlign={["center", "center", "right", "right"]}
        >
          <DownloadButton />
        </Box>
      </Flex>
    </LandingLayout>
  </Box>
);
