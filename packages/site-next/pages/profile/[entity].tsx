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
import { Box, Center } from "@chakra-ui/react";
import { LandingLayout } from "@/components";
import { DEFAULT_ENDPOINT } from "@/constants";
import { getTwitterTld } from "utils/twitter";
import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@solana/spl-name-service";

async function tryProm<A>(prom: Promise<A>): Promise<A | undefined> {
  try {
    return await prom;
  } catch (e) {
    console.error(e);
  }

  return undefined;
}

const findTokenRef = async (entity: string) => {};

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

  const [tokenCollectiveSdk, splTokenMetadataSdk] =
    (await tryProm(
      Promise.all([
        SplTokenCollective.init(provider),
        SplTokenMetadata.init(provider),
      ])
    )) || [];

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
    } catch {}
  }

  console.log(tokenRef?.mint?.toBase58());

  return {
    props: {
      name: "test" || null,
      description: "description" || null,
      image: "image" || null,
    },
  };
};

const ProfileEntityMapper: NextPage = ({
  name,
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

      <LandingLayout>
        <Box w="full" h="full" overflow="auto" paddingTop={{ sm: "18px" }}>
          <Center flexGrow={1}>
            <Center bg="white" shadow="xl" rounded="lg" maxW="600px">
              {entity && entity}
            </Center>
          </Center>
        </Box>
      </LandingLayout>
    </Box>
  );
};

export default ProfileEntityMapper;
