import React, { useState, useEffect } from "react";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Provider } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import {
  usePublicKey,
  useTokenRef,
  useTokenRefForName,
  useTokenRefFromBonding,
} from "@strata-foundation/react";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SplTokenBonding } from "@strata-foundation/spl-token-bonding";
import { ITokenRef } from "@strata-foundation/spl-token-collective";
import { SplTokenMetadata } from "@strata-foundation/spl-utils";
import {
  NextPage,
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import { useTwitterTld } from "wumbo-common";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import { Box, Center } from "@chakra-ui/react";
import { LandingLayout } from "@/components/index";
import { DEFAULT_ENDPOINT } from "@/constants/index";

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const connection = new Connection(DEFAULT_ENDPOINT);
//   const provider = new Provider(
//     connection,
//     new NodeWallet(Keypair.generate()),
//     {}
//   );
//   const tokenBondingSdk = await SplTokenBonding.init(provider);

//   const [tokenBondingKey] = await SplTokenBonding.tokenBondingKey(
//     new PublicKey(context.params?.tokenMintKey as string)
//   );

//   const tokenBondingAcct = await tokenBondingSdk.getTokenBonding(
//     tokenBondingKey
//   );

//   const tokenMetadataSdk = await SplTokenMetadata.init(provider);

//   const metadataAcc =
//     tokenBondingAcct &&
//     (await tokenMetadataSdk.getMetadata(
//       await Metadata.getPDA(tokenBondingAcct?.targetMint)
//     ));

//   const metadata = await SplTokenMetadata.getArweaveMetadata(
//     metadataAcc?.data.uri
//   );

//   const name = metadataAcc?.data.name || null;
//   const description = `View TVL, Holders, Price Trend, And support ${name} by becoming a holder yourself!`;
//   const image =
//     (await SplTokenMetadata.getImage(metadataAcc?.data.uri)) || null;

//   return {
//     props: {
//       name,
//       description,
//       image,
//     },
//   };
// };

// can pass it any of the following for entity
// handle | tokenRef | tokenMint | tokenBonding
// and will return a tokenRef
const useTokenRefFromEntity = ({
  entity,
  tld,
}: {
  entity?: string;
  tld?: PublicKey;
}): {
  loading: boolean;
  tokenRef: ITokenRef | undefined;
  error: Error | undefined;
} => {
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenRef, setTokenRef] = useState<ITokenRef | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  return { loading, tokenRef, error };
};

const ProfileEntityMapper: NextPage = () => {
  const router = useRouter();
  const { entity } = router.query as { entity: string | undefined };
  const tld = useTwitterTld();
  // const { loading, tokenRef, error } = useTokenRefFromEntity({ entity, tld });

  console.log(tld);
  return (
    <Box>
      {/* <Head>
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
        <meta
          property="twitter:url"
          content={`https://wum.bo/profile/${tokenMintKeyRaw}/`}
        />
        <meta name="twitter:title" content={`${name}'s Wum.bo Profile`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </Head> */}

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
