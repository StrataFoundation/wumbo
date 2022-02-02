import React from "react";
import { Header } from "../components/sections/Header";
import { Hero } from "../components/sections/Hero";
import { Monetize } from "../components/sections/Monetize";
import { XRay } from "../components/sections/XRay";
import { Download } from "../components/sections/Download";
import { Nft } from "../components/sections/Nft";
import { Tutorial } from "../components/sections/Tutorial";
import { Investors } from "../components/sections/Investors";
import { Support } from "../components/sections/Support";
import { Team } from "../components/sections/Team";
import { Footer } from "../components/sections/Footer";

export const Landing: React.FC = () => (
  <>
    <Header zIndex="1" />
    <Hero />
    <Monetize />
    <XRay />
    <Download />
    <Nft />
    <Tutorial />
    {/* <Investors /> */}
    <Support />
    <Download />
    <Team />
    <Footer />
  </>
);
