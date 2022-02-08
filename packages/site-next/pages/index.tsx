import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box, Container } from "@chakra-ui/react";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Wum.bo</title>
        <meta
          name="description"
          content="Wumbo is a Browser Extension that sits on top of Twitter and lets you mint tokens for your favorite creators."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Container>This is a test</Container>
      </main>
    </div>
  );
};

export default Home;
