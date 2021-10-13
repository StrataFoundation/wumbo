import React from "react";
import { Flex } from "@chakra-ui/react";
import Header from "../common/Header";
import Content from "./Content";
import Footer from "../common/Footer";
import BetaButton from "./BetaButton";

const BetaSplash: React.FC = () => (
  <Flex
    flexDirection="column"
    w="full"
    h="100vh"
    fontSize="md"
    color="white"
    bg="linear-gradient(147deg, rgba(0, 0, 0, 0.28) 15%, rgba(0, 0, 0, 0.32) 129%),
    linear-gradient(56deg, #2323ff -25%, #4f51ff 20%, #a53ef4 84%)"
  >
    <Header>
      <BetaButton />
    </Header>
    <Content />
    <div
      style={{
        background: "rgba(35, 35, 35, 0.28)",
      }}
    >
      <Footer />
    </div>
  </Flex>
);

export default BetaSplash;
