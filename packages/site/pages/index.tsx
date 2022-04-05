import React from "react";
import type { NextPage } from "next";
import { Box } from "@chakra-ui/react";

// Splash sections
import {
  Hero,
  Monetize,
  XRay,
  NFT,
  Tutorial,
  Investors,
  Support,
  Team,
  DownloadRow,
  Header,
} from "@/components";

const Home: NextPage = () => (
  <Box>
    <Header />

    <Box>
      <Hero />
      <Monetize />
      <XRay />
      <DownloadRow />
      <NFT />
      <Tutorial />
      <Investors />
      <Support />
      <DownloadRow />
      <Team />
    </Box>
  </Box>
);

export default Home;
