import React from "react";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Text,
  Image,
  Container,
  Flex,
  Heading,
  Icon,
  IconProps,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { profileServerSideProps } from "../../utils/profileServerSideProps";

export const Blob = (props: IconProps) => {
  return (
    <Icon
      width={"100%"}
      viewBox="0 0 578 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M239.184 439.443c-55.13-5.419-110.241-21.365-151.074-58.767C42.307 338.722-7.478 282.729.938 221.217c8.433-61.644 78.896-91.048 126.871-130.712 34.337-28.388 70.198-51.348 112.004-66.78C282.34 8.024 325.382-3.369 370.518.904c54.019 5.115 112.774 10.886 150.881 49.482 39.916 40.427 49.421 100.753 53.385 157.402 4.13 59.015 11.255 128.44-30.444 170.44-41.383 41.683-111.6 19.106-169.213 30.663-46.68 9.364-88.56 35.21-135.943 30.551z"
        fill="currentColor"
      />
    </Icon>
  );
};

export const getServerSideProps: GetServerSideProps = profileServerSideProps;

const ProfileEntityMapper: NextPage = ({
  tokenBondingKeyRaw,
  baseMintKeyRaw,
  targetMintKeyRaw,
  handle,
  name,
  symbol,
  image,
  description,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const handleOnLearnMore = () => router.push("/tutorial");
  const handleOnBecomeABacker = () => {
    location.replace(
      `https://app.${location.host}/swap/${tokenBondingKeyRaw}/${baseMintKeyRaw}/${targetMintKeyRaw}`
    );
  };

  return (
    <Box>
      <Head>
        <title>{name}</title>
        <link rel="icon" href="/favicon.svg" />
        <meta property="og:type" content="website" />
        <meta name="description" content={description} />
        <meta property="og:title" content={name} />
        <meta property="og:image" content={image} />
        <meta property="og:description" content={description} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="wum.bo" />
        <meta property="twitter:url" content={`REPLACEME`} />
        <meta name="twitter:title" content={`${name}'s Wum.bo Profile`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </Head>

      <Container maxW={"7xl"}>
        <Stack
          align={"center"}
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 40 }}
          direction={{ base: "column", md: "row" }}
        >
          <Flex
            flex={1}
            justify={"center"}
            aling={"center"}
            position={"relative"}
            w={"full"}
          >
            <Blob
              w={"150%"}
              h={"150%"}
              position={"absolute"}
              top={"-20%"}
              left={0}
              zIndex={-1}
              color={useColorModeValue("indigo.50", "indigo.400")}
            />
            <Box
              position={"relative"}
              height={"300px"}
              rounded={"2xl"}
              width={"50%"}
              overflow={"hidden"}
            >
              <Image
                alt={"CoinImage"}
                fit={"contain"}
                align={"center"}
                w={"100%"}
                h={"100%"}
                src={image}
              />
            </Box>
          </Flex>
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <span>
              <Heading
                as="h1"
                fontWeight="bold"
                lineHeight={1.1}
                fontSize={{ base: "3xl", sm: "4xl", lg: "5xl" }}
              >
                <Text
                  as={"span"}
                  position={"relative"}
                  bg="linear-gradient(273.71deg, #453AAF 14.63%, #106FEE 100.31%);"
                  bgClip="text"
                >
                  Show Your Support!
                </Text>
              </Heading>
              <Heading
                as="h1"
                fontWeight="bold"
                lineHeight={1.1}
                fontSize={{ base: "2xl", sm: "3xl", lg: "4xl" }}
              >
                <Text as={"span"}>
                  {handle
                    ? `Back @${handle} Today`
                    : `Become a holder of $${name} Today!`}
                </Text>
              </Heading>
            </span>
            {description && <Text color="gray.500">{description}</Text>}
            {!description && (
              <Text>
                <Text color="indigo.500" as="span">
                  ${symbol}
                </Text>
                &nbsp;is a social token minted through Wumbo
                {handle ? (
                  <>
                    {" "}
                    for{" "}
                    <Text color="indigo.500" as="span">
                      {handle}
                    </Text>
                  </>
                ) : (
                  ""
                )}
                . Wumbo is a Browser Extension that sits on top of Twitter and
                lets you mint tokens for your favorite creators. Build a
                thriving community and join them on their journey to the top!
              </Text>
            )}
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: "column", sm: "row" }}
            >
              <Button
                size={"lg"}
                fontWeight={"normal"}
                px={6}
                colorScheme={"indigo"}
                onClick={handleOnBecomeABacker}
              >
                Become a Backer
              </Button>
              <Button
                size={"lg"}
                fontWeight={"normal"}
                px={6}
                onClick={handleOnLearnMore}
              >
                Learn More
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default ProfileEntityMapper;
