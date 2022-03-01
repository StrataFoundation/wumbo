import React, { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, Stack, Image } from "@chakra-ui/react";
import { LandingLayout, DownloadButton } from "@/components";

export const Hero: React.FC = () => {
  const [isMobile, setMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const updateMobile = () => {
      setMobile(window.innerWidth < 1280 ? true : false);
    };

    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => {
      window.removeEventListener("resize", updateMobile);
    };
  }, []);

  return (
    <Flex flexDirection="column" w="full">
      <Box
        bg="linear-gradient(272.23deg, #5D34A9 -0.32%, #413BB1 93.88%), #FFFFFF;"
        position="relative"
      >
        <LandingLayout>
          <Flex
            align="center"
            justify={{
              base: "center",
              md: "space-between",
              xl: "space-between",
            }}
            direction={{ base: "column-reverse", md: "row" }}
            wrap="nowrap"
            minH="70vh"
            px={8}
            mb={16}
          >
            <Stack
              spacing={6}
              w={{ base: "80%", md: "40%" }}
              align={["center", "center", "flex-start", "flex-start"]}
              zIndex="1"
            >
              <Heading
                as="h1"
                size="xl"
                fontWeight="bold"
                color="white"
                textAlign={["center", "center", "left", "left"]}
              >
                The power to support your favorite artists and influencers is
                now in your hands{" "}
                <Text as="span" fontWeight="light">
                  with Wumbo.
                </Text>
              </Heading>
              <Heading
                as="h2"
                size="md"
                color="white"
                opacity="0.8"
                fontWeight="normal"
                lineHeight={1.5}
                textAlign={["center", "center", "left", "left"]}
              >
                Wumbo is a Browser Extension that sits on top of Twitter and
                lets you mint tokens for your favorite creators. Build a
                thriving community and join them on their journey to the top!
              </Heading>
              <DownloadButton />
            </Stack>
            {!isMobile ? (
              <Box position="absolute" right="0" bottom="0" w="70%">
                <Image src="/hero.png" alt="herotop" boxSize="100%" />
              </Box>
            ) : (
              <Box
                w={{ base: "100%", sm: "80%" }}
                position="relative"
                mr={{ base: 0, md: "-150px" }}
              >
                <Image
                  float="right"
                  src="/heromobile.png"
                  alt="heromobile"
                  boxSize="100%"
                />
              </Box>
            )}
          </Flex>
        </LandingLayout>
      </Box>
      {!isMobile && (
        <Flex w="full" position="relative" mb="20">
          <Box position="absolute" right="0" top="0" w="70%">
            <Image src="/hero2.png" alt="herobottom" boxSize="100%" />
          </Box>
        </Flex>
      )}
    </Flex>
  );
};
