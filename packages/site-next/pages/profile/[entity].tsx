import React from "react";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Provider } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import {
  ITokenRef,
  SplTokenCollective,
} from "@strata-foundation/spl-token-collective";
import { SplTokenMetadata } from "@strata-foundation/spl-utils";
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
import { LandingLayout } from "@/components";
import { DEFAULT_ENDPOINT } from "@/constants";
import { getTwitterTld } from "utils/twitter";
import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@solana/spl-name-service";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const connection = new Connection(DEFAULT_ENDPOINT);
  const provider = new Provider(
    connection,
    new NodeWallet(Keypair.generate()),
    {}
  );

  const entity = context.params?.entity as string;
  const tld = await getTwitterTld();
  const pK: PublicKey | undefined = (() => {
    try {
      return new PublicKey(entity);
    } catch {
      // ignore
    }
  })();

  const tokenCollectiveSdk = await SplTokenCollective.init(provider);
  const tokenMetadataSdk = await SplTokenMetadata.init(provider);
  let tokenRef: ITokenRef | null | undefined;

  if (!tokenRef && pK) {
    try {
      tokenRef = await tokenCollectiveSdk?.getTokenRef(pK);
    } catch {}
  }

  if (!tokenRef && pK) {
    try {
      const [mTRK] = await SplTokenCollective.mintTokenRefKey(pK);
      tokenRef = await tokenCollectiveSdk?.getTokenRef(mTRK);
    } catch {}
  }

  if (!tokenRef && pK) {
    try {
      const [wTRK] = await SplTokenCollective.ownerTokenRefKey({
        owner: pK,
        isPrimary: true,
      });
      tokenRef = await tokenCollectiveSdk?.getTokenRef(wTRK);
    } catch {}
  }

  if (!tokenRef && !pK) {
    const twitterRegistryKey = await getNameAccountKey(
      await getHashedName(entity),
      undefined,
      tld
    );

    try {
      const { owner } = await NameRegistryState.retrieve(
        connection,
        twitterRegistryKey
      );

      const [cTRK] = await SplTokenCollective.ownerTokenRefKey({
        owner: owner,
      });
      tokenRef = await tokenCollectiveSdk?.getTokenRef(cTRK);
    } catch {}
  }

  if (!tokenRef && !pK) {
    const twitterRegistryKey = await getNameAccountKey(
      await getHashedName(entity),
      undefined,
      tld
    );

    try {
      const [ucTRK] = await SplTokenCollective.ownerTokenRefKey({
        owner: twitterRegistryKey,
        mint: SplTokenCollective.OPEN_COLLECTIVE_MINT_ID,
      });
      tokenRef = await tokenCollectiveSdk?.getTokenRef(ucTRK);
      console.log("here", tokenRef);
    } catch {}
  }

  const metadataAcc = await tokenMetadataSdk.getMetadata(
    await Metadata.getPDA(tokenRef!.mint.toBase58())
  );

  let metadata = null;

  try {
    metadata = await SplTokenMetadata.getArweaveMetadata(metadataAcc?.data.uri);
  } catch (e: any) {
    console.error(e);
  }

  const name =
    metadataAcc?.data?.name.length == 32
      ? metadata?.name
      : metadataAcc?.data?.name;

  return {
    props: {
      name: name || null,
      symbol: metadataAcc?.data?.symbol || null,
      description: metadata?.description || null,
      image: (await SplTokenMetadata.getImage(metadataAcc?.data.uri)) || null,
    },
  };
};

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

const ProfileEntityMapper: NextPage = ({
  name,
  symbol,
  image,
  description,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { entity } = router.query as { entity: string | undefined };

  return (
    <Box>
      <Head>
        <title>{name}</title>
        <link rel="icon" href="/favicon.svg" />
        <meta name="twitter:card" content="summary_large_image" />
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
            align={"center"}
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
                fit={"cover"}
                align={"center"}
                w={"100%"}
                h={"100%"}
                src={image}
              />
            </Box>
          </Flex>
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading
              as="h1"
              fontWeight="bold"
              lineHeight={1.1}
              fontSize={{ base: "3xl", sm: "4xl", lg: "5xl" }}
            >
              <Text as={"span"} position={"relative"}>
                Back {name} Today!
              </Text>
              <br />
              <Text
                as={"span"}
                bg="linear-gradient(273.71deg, #453AAF 14.63%, #106FEE 100.31%);"
                bgClip="text"
              >
                use everywhere!
              </Text>
            </Heading>
            <Text color={"gray.500"}>
              {description
                ? description
                : `$${symbol} is a social token minted through Wum.bo for @redacted_noah. `}
            </Text>
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: "column", sm: "row" }}
            >
              <Button
                size={"lg"}
                fontWeight={"normal"}
                px={6}
                colorScheme={"indigo"}
              >
                Become a Backer
              </Button>
              <Button size={"lg"} fontWeight={"normal"} px={6}>
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
