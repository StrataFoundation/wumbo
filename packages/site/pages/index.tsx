import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { SITE_URL } from "@/constants";

// Splash sections
import {
  Hero,
  Monetize,
  XRay,
  NFT,
  Tutorial,
  Support,
  Team,
  DownloadRow,
} from "@/components";

const Home: NextPage = () => {
  const seoDescription =
    "Wumbo is a Browser Extension that sits on top of Twitter and lets you mint tokens for your favorite creators.";

  return (
    <Box>
      <Head>
        <title>Wum.bo</title>
        <link rel="icon" href="/favicon.svg" />
        <meta property="og:type" content="website" />
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content="Wum.bo" />
        <meta property="og:image" content={`${SITE_URL}/seo-splash.png`} />
        <meta property="og:description" content={seoDescription} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="wum.bo" />
        <meta property="twitter:url" content={`https://wum.bo`} />
        <meta name="twitter:title" content="Wum.bo" />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={`${SITE_URL}/seo-splash.png`} />
      </Head>

      <Box>
        <Hero />
        <Monetize />
        <XRay />
        <DownloadRow />
        <NFT />
        <Tutorial />
        <Support />
        <DownloadRow />
        <Team />
      </Box>
    </Box>
  );
};

export default Home;
