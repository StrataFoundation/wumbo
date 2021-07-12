import React from "react";
import Header from "./Header";
import Content from "./Content";
import Footer from "./Footer";

const BetaSplash: React.FC = () => (
  <div
    className="flex flex-col min-h-screen font-sans font-medium text-white"
    style={{
      background: `
        linear-gradient(147deg, rgba(0, 0, 0, 0.28) 15%, rgba(0, 0, 0, 0.32) 129%),
        linear-gradient(56deg, #2323ff -25%, #4f51ff 20%, #a53ef4 84%)
      `,
    }}
  >
    <Header />
    <Content />
    <Footer />
  </div>
);

export default BetaSplash;
