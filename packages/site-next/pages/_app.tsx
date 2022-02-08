import type { AppProps } from "next/app";
import { FC } from "react";
import { Providers } from "../components/Providers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

// Use require instead of import since order matters
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => (
  <Providers>
    <Header />
    <Component {...pageProps} />
    <Footer />
  </Providers>
);

export default App;
