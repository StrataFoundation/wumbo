import type { AppProps } from "next/app";
import { FC } from "react";
import "../utils/bufferFill";
import { Providers, Header, Footer } from "@/components";

// Use require instead of import since order matters
require("../styles/globals.css");
require("@solana/wallet-adapter-react-ui/styles.css");


const App: FC<AppProps> = ({ Component, pageProps }) => (
  <Providers>
    <Component {...pageProps} />
    <Footer />
  </Providers>
);

export default App;
