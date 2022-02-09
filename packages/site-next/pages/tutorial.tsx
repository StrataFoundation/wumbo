import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box } from "@chakra-ui/react";

// Splash sections
import { Tutorial as TutorialContent } from "@/components/index";

const Tutorial: NextPage = () => {
  return (
    <Box>
      <Head>
        <title>Wum.bo</title>
        <meta
          name="description"
          content="Wumbo is a Browser Extension that sits on top of Twitter and lets you mint tokens for your favorite creators."
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <Box>
        <TutorialContent />
      </Box>
    </Box>
  );
};

export default Tutorial;
